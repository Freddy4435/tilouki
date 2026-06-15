import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RelaySearchResult } from "@/lib/shipping/types";

const mocks = vi.hoisted(() => ({
  guardApiRequest: vi.fn<() => Promise<null | Response>>(async () => null),
  isShippingConfiguredForCheckout: vi.fn(() => true),
  getShippingConfigurationError: vi.fn(() => "Configuration Mondial Relay requise."),
  getShippingProvider: vi.fn(),
  searchRelayPoints: vi.fn<() => Promise<RelaySearchResult>>(),
}));

vi.mock("@/lib/security/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/security/api")>();
  return {
    ...actual,
    guardApiRequest: mocks.guardApiRequest,
  };
});

vi.mock("@/lib/shipping/checkout", () => ({
  isShippingConfiguredForCheckout: mocks.isShippingConfiguredForCheckout,
  getShippingConfigurationError: mocks.getShippingConfigurationError,
  isRelayPointIdAllowed: (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return false;
    if (process.env.NODE_ENV === "production" && trimmed.startsWith("DEV-MR-")) {
      return false;
    }
    return true;
  },
}));

vi.mock("@/lib/shipping/provider", () => ({
  getShippingProvider: mocks.getShippingProvider,
}));

import { GET } from "@/app/api/shipping/relay-points/route";

function relayRequest(query = "zip=75001&country=FR&carrier=mondial_relay"): Request {
  return new Request(`http://localhost/api/shipping/relay-points?${query}`);
}

beforeEach(() => {
  mocks.getShippingProvider.mockReturnValue({
    name: "mondial_relay",
    searchRelayPoints: mocks.searchRelayPoints,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mocks.guardApiRequest.mockResolvedValue(null);
  mocks.isShippingConfiguredForCheckout.mockReturnValue(true);
});

describe("GET /api/shipping/relay-points", () => {
  it("retourne les points relais valides", async () => {
    mocks.searchRelayPoints.mockResolvedValue({
      points: [
        {
          id: "012417",
          name: "BODHI TELECOM",
          address: "2 RUE DE MULHOUSE",
          zip: "75002",
          city: "PARIS",
          country: "FR",
          distanceMeters: 900,
        },
      ],
      source: "mondial_relay_api",
      configured: true,
    });

    const response = await GET(relayRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.points).toHaveLength(1);
    expect(body.points[0]?.id).toBe("012417");
    expect(body.devMock).toBe(false);
  });

  it("refuse les mocks en production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.searchRelayPoints.mockResolvedValue({
      points: [
        {
          id: "DEV-MR-75001-01",
          name: "[DEV] Tabac",
          address: "1 rue Test",
          zip: "75001",
          city: "PARIS",
          country: "FR",
          isDevMock: true,
        },
      ],
      source: "dev_mock",
      configured: true,
    });

    const response = await GET(relayRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.points).toEqual([]);
    expect(body.configured).toBe(false);
    expect(body.devMock).toBe(false);
    expect(body.error).toContain("Mondial Relay");
  });

  it("filtre les identifiants mock même si la source API est réelle", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.searchRelayPoints.mockResolvedValue({
      points: [
        {
          id: "DEV-MR-75001-01",
          name: "Faux point",
          address: "1 rue Test",
          zip: "75001",
          city: "PARIS",
          country: "FR",
          isDevMock: true,
        },
        {
          id: "012417",
          name: "Vrai point",
          address: "2 rue Test",
          zip: "75001",
          city: "PARIS",
          country: "FR",
        },
      ],
      source: "mondial_relay_api",
      configured: true,
    });

    const response = await GET(relayRequest());
    const body = await response.json();

    expect(body.points).toHaveLength(1);
    expect(body.points[0]?.id).toBe("012417");
  });
});
