import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getAvailableCarriers, isCarrierConfigured } from "@/lib/shipping/carriers";
import { getShippingProvider, resetShippingProvider } from "@/lib/shipping/provider";
import { ChronopostApiProvider } from "@/lib/shipping/providers/chronopost";
import {
  DevMockShippingProvider,
  UnconfiguredShippingProvider,
} from "@/lib/shipping/providers/dev-mock";
import { MondialRelayApiProvider } from "@/lib/shipping/providers/mondial-relay/api";

function configureMondialRelay() {
  vi.stubEnv("MONDIAL_RELAY_BRAND_ID", "BDTEST13");
  vi.stubEnv("MONDIAL_RELAY_PRIVATE_KEY", "PrivateK");
}

function configureChronopost() {
  vi.stubEnv("CHRONOPOST_ACCOUNT_NUMBER", "12345678");
  vi.stubEnv("CHRONOPOST_PASSWORD", "123456");
}

beforeEach(() => {
  resetShippingProvider();
  vi.stubEnv("MONDIAL_RELAY_BRAND_ID", "");
  vi.stubEnv("MONDIAL_RELAY_ENSEIGNE", "");
  vi.stubEnv("NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID", "");
  vi.stubEnv("MONDIAL_RELAY_PRIVATE_KEY", "");
  vi.stubEnv("CHRONOPOST_ACCOUNT_NUMBER", "");
  vi.stubEnv("CHRONOPOST_PASSWORD", "");
  vi.stubEnv("SHIPPING_DEV_MOCK", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetShippingProvider();
});

describe("getShippingProvider — factory multi-transporteur", () => {
  it("retourne le provider API Mondial Relay quand MR est configuré", () => {
    configureMondialRelay();

    const provider = getShippingProvider("mondial_relay");
    expect(provider).toBeInstanceOf(MondialRelayApiProvider);
    expect(provider.carrier).toBe("mondial_relay");
  });

  it("retourne Mondial Relay par défaut (sans argument — compat historique)", () => {
    configureMondialRelay();

    expect(getShippingProvider()).toBeInstanceOf(MondialRelayApiProvider);
  });

  it("retourne le provider API Chronopost quand Chronopost est configuré", () => {
    configureChronopost();

    const provider = getShippingProvider("chronopost");
    expect(provider).toBeInstanceOf(ChronopostApiProvider);
    expect(provider.carrier).toBe("chronopost");
  });

  it("retourne le mock dev pour chaque transporteur quand rien n'est configuré", () => {
    expect(getShippingProvider("mondial_relay")).toBeInstanceOf(DevMockShippingProvider);
    expect(getShippingProvider("chronopost")).toBeInstanceOf(DevMockShippingProvider);
  });

  it("retourne unconfigured pour Chronopost si seul MR est configuré (mock dev coupé)", () => {
    configureMondialRelay();

    expect(getShippingProvider("mondial_relay")).toBeInstanceOf(MondialRelayApiProvider);
    expect(getShippingProvider("chronopost")).toBeInstanceOf(UnconfiguredShippingProvider);
  });

  it("met en cache un provider par transporteur et se réinitialise", () => {
    configureMondialRelay();
    const first = getShippingProvider("mondial_relay");

    expect(getShippingProvider("mondial_relay")).toBe(first);

    resetShippingProvider();
    expect(getShippingProvider("mondial_relay")).not.toBe(first);
  });
});

describe("getAvailableCarriers", () => {
  it("ne propose que Mondial Relay sans variables CHRONOPOST_* (zéro régression)", () => {
    configureMondialRelay();

    const carriers = getAvailableCarriers();

    expect(carriers.map((c) => c.id)).toEqual(["mondial_relay"]);
    expect(carriers[0]!.devMock).toBe(false);
  });

  it("propose les deux transporteurs quand MR et Chronopost sont configurés", () => {
    configureMondialRelay();
    configureChronopost();

    expect(getAvailableCarriers().map((c) => c.id)).toEqual([
      "mondial_relay",
      "chronopost",
    ]);
  });

  it("propose les deux transporteurs en mock dev quand rien n'est configuré", () => {
    const carriers = getAvailableCarriers();

    expect(carriers.map((c) => c.id)).toEqual(["mondial_relay", "chronopost"]);
    expect(carriers.every((c) => c.devMock)).toBe(true);
  });

  it("ne propose aucun transporteur si mock dev désactivé et rien configuré", () => {
    vi.stubEnv("SHIPPING_DEV_MOCK", "false");

    expect(getAvailableCarriers()).toEqual([]);
    expect(isCarrierConfigured("mondial_relay")).toBe(false);
    expect(isCarrierConfigured("chronopost")).toBe(false);
  });
});

describe("dev mock par transporteur", () => {
  it("génère des identifiants préfixés DEV-MR- / DEV-CHR- distincts", async () => {
    const mr = new DevMockShippingProvider("mondial_relay");
    const chrono = new DevMockShippingProvider("chronopost");

    const mrResult = await mr.searchRelayPoints({ zip: "75001" });
    const chronoResult = await chrono.searchRelayPoints({ zip: "75001" });

    expect(mrResult.points.every((p) => p.id.startsWith("DEV-MR-"))).toBe(true);
    expect(chronoResult.points.every((p) => p.id.startsWith("DEV-CHR-"))).toBe(true);
  });
});
