import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  validateCartStock: vi.fn(),
  validateRelayPointDetailed: vi.fn(),
  findStorefrontBlockedSlugInCheckoutItems: vi.fn(),
  findDevSeedSlugInCheckoutItems: vi.fn(),
  getShopSettings: vi.fn(),
  isCheckoutLegalReady: vi.fn(),
  isShippingConfiguredForCheckout: vi.fn(),
}));

vi.mock("@/lib/supabase/queries/cart", () => ({
  validateCartStock: mocks.validateCartStock,
}));

vi.mock("@/lib/catalog/dev-seed-guard", () => ({
  findStorefrontBlockedSlugInCheckoutItems:
    mocks.findStorefrontBlockedSlugInCheckoutItems,
  findDevSeedSlugInCheckoutItems: mocks.findDevSeedSlugInCheckoutItems,
  DEV_SEED_CHECKOUT_BLOCKED_MESSAGE: "demo blocked",
}));

vi.mock("@/lib/shipping/validate-relay", () => ({
  validateRelayPointDetailed: mocks.validateRelayPointDetailed,
  RELAY_VALIDATION_UNAVAILABLE_MESSAGE: "Indisponible",
}));

vi.mock("@/lib/supabase/queries/shop", () => ({
  getShopSettings: mocks.getShopSettings,
}));

vi.mock("@/lib/legal/publication", () => ({
  isCheckoutLegalReady: mocks.isCheckoutLegalReady,
  LEGAL_PUBLICATION_BLOCK_MESSAGE: "legal blocked",
}));

import { getShippingConfigurationError } from "@/lib/shipping/checkout";
import { createCheckoutSession } from "@/lib/stripe/create-checkout-session";

vi.mock("@/lib/shipping/checkout", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shipping/checkout")>();
  return {
    ...actual,
    isShippingConfiguredForCheckout: mocks.isShippingConfiguredForCheckout,
  };
});

const checkoutInput = {
  customer: {
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie@example.com",
    phone: "0612345678",
  },
  relayPoint: {
    id: "MR-123",
    name: "Relais",
    address: "1 rue Test",
    zip: "75001",
    city: "Paris",
    country: "FR",
  },
  items: [{ variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 }],
  carrier: "mondial_relay" as const,
};

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  mocks.validateCartStock.mockResolvedValue({ valid: true });
  mocks.findStorefrontBlockedSlugInCheckoutItems.mockResolvedValue(null);
  mocks.findDevSeedSlugInCheckoutItems.mockResolvedValue(null);
  mocks.isCheckoutLegalReady.mockResolvedValue(true);
  mocks.isShippingConfiguredForCheckout.mockReturnValue(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("createCheckoutSession — livraison production", () => {
  it("bloque le paiement si le transporteur n'est pas configuré en production", async () => {
    mocks.isShippingConfiguredForCheckout.mockReturnValue(false);

    await expect(createCheckoutSession(checkoutInput)).rejects.toMatchObject({
      message: getShippingConfigurationError("mondial_relay"),
      status: 503,
    });
  });
});
