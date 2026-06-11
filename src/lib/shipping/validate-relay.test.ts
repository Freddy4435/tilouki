import { afterEach, describe, expect, it, vi } from "vitest";

import type { RelayLookupResult, RelaySearchResult } from "@/lib/shipping/types";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  searchRelayPoints: vi.fn<() => Promise<RelaySearchResult>>(),
  findRelayPoint: vi.fn<() => Promise<RelayLookupResult>>(),
  chronoSearchRelayPoints: vi.fn<() => Promise<RelaySearchResult>>(),
  chronoFindRelayPoint: vi.fn<() => Promise<RelayLookupResult>>(),
}));

vi.mock("@/lib/shipping/provider", () => ({
  getShippingProvider: (carrier?: string) =>
    carrier === "chronopost"
      ? {
          name: "chronopost" as const,
          searchRelayPoints: mocks.chronoSearchRelayPoints,
          findRelayPoint: mocks.chronoFindRelayPoint,
        }
      : {
          name: "mondial_relay" as const,
          searchRelayPoints: mocks.searchRelayPoints,
          findRelayPoint: mocks.findRelayPoint,
        },
}));

vi.mock("@/lib/shipping/checkout", () => ({
  isRelayPointIdAllowed: (id: string) => id.trim().length > 0,
  isShippingConfiguredForCheckout: () => true,
  getShippingConfigurationError: () => "Configuration Mondial Relay requise.",
}));

vi.mock("@/lib/security/log", () => ({
  logSecure: vi.fn(),
}));

import {
  RELAY_VALIDATION_UNAVAILABLE_MESSAGE,
  validateRelayPointDetailed,
} from "@/lib/shipping/validate-relay";

const relayInput = {
  id: "012417",
  name: "BODHI TELECOM",
  address: "2 RUE DE MULHOUSE",
  zip: "75002",
  city: "PARIS",
  country: "FR",
};

const matchingPoint = {
  id: "012417",
  name: "BODHI TELECOM",
  address: "2 RUE DE MULHOUSE",
  zip: "75002",
  city: "PARIS",
  country: "FR",
};

function searchResult(points: (typeof matchingPoint)[]): RelaySearchResult {
  return {
    points,
    source: "mondial_relay_api",
    configured: true,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("validateRelayPointDetailed — lookup direct", () => {
  it("valide via le lookup direct sans recherche par CP", async () => {
    mocks.findRelayPoint.mockResolvedValue({ status: "found", point: matchingPoint });

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(true);
    expect(mocks.findRelayPoint).toHaveBeenCalledWith("012417", "FR");
    expect(mocks.searchRelayPoints).not.toHaveBeenCalled();
  });

  it("refuse un point retrouvé mais avec un code postal incohérent", async () => {
    mocks.findRelayPoint.mockResolvedValue({
      status: "found",
      point: { ...matchingPoint, zip: "69001" },
    });

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("ne correspond pas");
    expect(mocks.searchRelayPoints).not.toHaveBeenCalled();
  });

  it("refuse un identifiant inconnu (not_found) sans fallback", async () => {
    mocks.findRelayPoint.mockResolvedValue({ status: "not_found" });

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("introuvable");
    expect(mocks.searchRelayPoints).not.toHaveBeenCalled();
  });

  it("remonte une erreur de configuration au checkout", async () => {
    mocks.findRelayPoint.mockResolvedValue({ status: "configuration" });

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Configuration Mondial Relay requise.");
    expect(mocks.searchRelayPoints).not.toHaveBeenCalled();
  });
});

describe("validateRelayPointDetailed — secours recherche CP", () => {
  it("retombe sur la recherche CP quand le lookup est indisponible", async () => {
    mocks.findRelayPoint.mockResolvedValue({ status: "unavailable" });
    mocks.searchRelayPoints.mockResolvedValue(searchResult([matchingPoint]));

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(true);
    expect(mocks.searchRelayPoints).toHaveBeenCalledWith({
      zip: "75002",
      country: "FR",
      city: "PARIS",
    });
  });

  it("retombe sur la recherche CP quand le lookup lève une exception", async () => {
    mocks.findRelayPoint.mockRejectedValue(new Error("boom"));
    mocks.searchRelayPoints.mockResolvedValue(searchResult([matchingPoint]));

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(true);
    expect(mocks.searchRelayPoints).toHaveBeenCalledOnce();
  });

  it("refuse si le point est absent des résultats de secours", async () => {
    mocks.findRelayPoint.mockResolvedValue({ status: "unavailable" });
    mocks.searchRelayPoints.mockResolvedValue(
      searchResult([{ ...matchingPoint, id: "999999" }]),
    );

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("n'est plus disponible");
  });

  it("signale l'indisponibilité si lookup ET recherche CP échouent", async () => {
    mocks.findRelayPoint.mockResolvedValue({ status: "unavailable" });
    mocks.searchRelayPoints.mockRejectedValue(new Error("réseau"));

    const result = await validateRelayPointDetailed(relayInput);

    expect(result.valid).toBe(false);
    expect(result.unavailable).toBe(true);
    expect(result.error).toBe(RELAY_VALIDATION_UNAVAILABLE_MESSAGE);
  });
});

describe("validateRelayPointDetailed — gardes", () => {
  it("refuse un point incomplet sans appeler le provider", async () => {
    const result = await validateRelayPointDetailed({ ...relayInput, id: "" });

    expect(result.valid).toBe(false);
    expect(mocks.findRelayPoint).not.toHaveBeenCalled();
    expect(mocks.searchRelayPoints).not.toHaveBeenCalled();
  });

  it("refuse les points mock (dev_mock) en production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.findRelayPoint.mockResolvedValue({ status: "unavailable" });
    mocks.searchRelayPoints.mockResolvedValue({
      points: [{ ...matchingPoint, id: "DEV-MR-75002-01", isDevMock: true }],
      source: "dev_mock",
      configured: true,
    });

    const result = await validateRelayPointDetailed({
      ...relayInput,
      id: "DEV-MR-75002-01",
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("développement");
    vi.unstubAllEnvs();
  });

  it("accepte un point mock valide hors production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.findRelayPoint.mockResolvedValue({ status: "unavailable" });
    mocks.searchRelayPoints.mockResolvedValue({
      points: [{ ...matchingPoint, id: "DEV-MR-75002-01", isDevMock: true }],
      source: "dev_mock",
      configured: true,
    });

    const result = await validateRelayPointDetailed({
      ...relayInput,
      id: "DEV-MR-75002-01",
    });

    expect(result.valid).toBe(true);
    vi.unstubAllEnvs();
  });
});

describe("validateRelayPointDetailed — validation croisée multi-transporteur", () => {
  it("valide via le provider Chronopost pour une commande Chronopost", async () => {
    mocks.chronoFindRelayPoint.mockResolvedValue({
      status: "found",
      point: matchingPoint,
    });

    const result = await validateRelayPointDetailed(relayInput, "chronopost");

    expect(result.valid).toBe(true);
    expect(mocks.chronoFindRelayPoint).toHaveBeenCalledWith("012417", "FR");
    expect(mocks.findRelayPoint).not.toHaveBeenCalled();
    expect(mocks.searchRelayPoints).not.toHaveBeenCalled();
  });

  it("refuse un point Mondial Relay sur une commande Chronopost", async () => {
    // L'identifiant MR est inconnu du réseau Pickup → not_found côté Chronopost.
    mocks.chronoFindRelayPoint.mockResolvedValue({ status: "not_found" });

    const result = await validateRelayPointDetailed(relayInput, "chronopost");

    expect(result.valid).toBe(false);
    expect(result.error).toContain("introuvable");
    expect(mocks.findRelayPoint).not.toHaveBeenCalled();
  });

  it("refuse un point Chronopost sur une commande Mondial Relay", async () => {
    mocks.findRelayPoint.mockResolvedValue({ status: "not_found" });

    const result = await validateRelayPointDetailed(
      { ...relayInput, id: "1699P" },
      "mondial_relay",
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain("introuvable");
    expect(mocks.chronoFindRelayPoint).not.toHaveBeenCalled();
  });
});
