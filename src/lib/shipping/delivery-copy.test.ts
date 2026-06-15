import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildLegalDeliveryDelaysHtml,
  getCarrierEstimatedDelay,
  LEGAL_DELIVERY_METHOD,
  LEGAL_SHIPPING_FEES,
} from "@/lib/shipping/delivery-copy";
import { SHIPPING_SERVICES } from "@/lib/shipping/services";

describe("delivery-copy", () => {
  it("expose les délais alignés sur SHIPPING_SERVICES", () => {
    for (const service of SHIPPING_SERVICES) {
      expect(getCarrierEstimatedDelay(service.carrier)).toBe(service.estimatedDelay);
    }
  });

  it("inclut les deux transporteurs dans le paragraphe légal", () => {
    const html = buildLegalDeliveryDelaysHtml();
    expect(html).toContain("Mondial Relay");
    expect(html).toContain("3 à 5 jours ouvrés");
    expect(html).toContain("Chronopost");
    expect(html).toContain("2 à 3 jours ouvrés");
  });

  it("partage les textes mode et frais avec le contexte légal", () => {
    expect(LEGAL_DELIVERY_METHOD).toContain("point relais");
    expect(LEGAL_SHIPPING_FEES).toContain("avant validation définitive");
  });
});

describe("isShippingConfiguredForCheckout — production", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuse Mondial Relay en production sans identifiants, même si SHIPPING_DEV_MOCK=true", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SHIPPING_DEV_MOCK", "true");
    vi.stubEnv("MONDIAL_RELAY_BRAND_ID", "");
    vi.stubEnv("MONDIAL_RELAY_PRIVATE_KEY", "");

    const { isShippingConfiguredForCheckout } = await import("@/lib/shipping/checkout");
    expect(isShippingConfiguredForCheckout("mondial_relay")).toBe(false);
  });

  it("accepte Mondial Relay en production avec identifiants", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SHIPPING_DEV_MOCK", "true");
    vi.stubEnv("MONDIAL_RELAY_BRAND_ID", "BDTEST");
    vi.stubEnv("MONDIAL_RELAY_PRIVATE_KEY", "secret");

    const { isShippingConfiguredForCheckout } = await import("@/lib/shipping/checkout");
    expect(isShippingConfiguredForCheckout("mondial_relay")).toBe(true);
  });

  it("autorise le mock dev hors production sans identifiants", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONDIAL_RELAY_BRAND_ID", "");
    vi.stubEnv("MONDIAL_RELAY_PRIVATE_KEY", "");

    const { isShippingConfiguredForCheckout } = await import("@/lib/shipping/checkout");
    expect(isShippingConfiguredForCheckout("mondial_relay")).toBe(true);
  });
});
