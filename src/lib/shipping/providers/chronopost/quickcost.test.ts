import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/security/log", () => ({
  logSecure: vi.fn(),
}));

import {
  getQuickCostPriceCents,
  resetQuickCostCache,
} from "@/lib/shipping/providers/chronopost/quickcost";

function configureChronopost() {
  vi.stubEnv("CHRONOPOST_ACCOUNT_NUMBER", "12345678");
  vi.stubEnv("CHRONOPOST_PASSWORD", "secretpass");
  vi.stubEnv("CHRONOPOST_USE_QUICKCOST", "true");
}

beforeEach(() => {
  resetQuickCostCache();
  vi.stubEnv("CHRONOPOST_ACCOUNT_NUMBER", "");
  vi.stubEnv("CHRONOPOST_PASSWORD", "");
  vi.stubEnv("CHRONOPOST_USE_QUICKCOST", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  resetQuickCostCache();
});

describe("getQuickCostPriceCents", () => {
  it("retourne null si QuickCost est désactivé", async () => {
    configureChronopost();
    vi.stubEnv("CHRONOPOST_USE_QUICKCOST", "false");

    const price = await getQuickCostPriceCents("75002", 500);

    expect(price).toBeNull();
  });

  it("retourne le montant TTC en centimes quand l'API répond OK", async () => {
    configureChronopost();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<return><errorCode>0</errorCode><amountTTC>6.90</amountTTC></return>`,
    });
    vi.stubGlobal("fetch", fetchMock);

    const price = await getQuickCostPriceCents("75002", 500);

    expect(price).toBe(690);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ws.chronopost.fr/quickcost-cxf/QuickcostServiceWS");
    expect(url).not.toMatch(/password|accountNumber/i);
    expect(init.method).toBe("POST");
    const body = String(init.body);
    expect(body).toContain("<chr:quickCost>");
    expect(body).toContain("<password>secretpass</password>");
    expect(body).toContain("<productCode>86</productCode>");
  });

  it("met en cache le résultat par tranche de poids", async () => {
    configureChronopost();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<return><errorCode>0</errorCode><amountTTC>5.90</amountTTC></return>`,
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await getQuickCostPriceCents("75002", 400);
    const second = await getQuickCostPriceCents("75002", 450);

    expect(first).toBe(590);
    expect(second).toBe(590);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("retourne null si l'API renvoie une erreur (fallback barème DB)", async () => {
    configureChronopost();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          `<return><errorCode>1500</errorCode><errorMessage>Identifiants invalides</errorMessage></return>`,
      }),
    );

    const price = await getQuickCostPriceCents("75002", 500);

    expect(price).toBeNull();
  });
});
