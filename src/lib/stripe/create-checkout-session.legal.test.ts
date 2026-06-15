import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  validateCartStock: vi.fn(),
  validateRelayPointDetailed: vi.fn(),
  findStorefrontBlockedSlugInCheckoutItems: vi.fn(),
  findDevSeedSlugInCheckoutItems: vi.fn(),
  createPendingOrder: vi.fn(),
  getShopSettings: vi.fn(),
  isShippingConfiguredForCheckout: vi.fn(() => true),
  isCheckoutLegalReady: vi.fn(),
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

vi.mock("@/lib/shipping/checkout", () => ({
  isShippingConfiguredForCheckout: mocks.isShippingConfiguredForCheckout,
  getShippingConfigurationError: vi.fn(),
}));

vi.mock("@/lib/supabase/queries/orders", () => ({
  createPendingOrder: mocks.createPendingOrder,
  markOrderPaymentFailed: vi.fn(),
  updateOrderStripeSession: vi.fn(),
}));

vi.mock("@/lib/supabase/queries/shop", () => ({
  getShopSettings: mocks.getShopSettings,
}));

vi.mock("@/lib/legal/publication", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/legal/publication")>();
  return {
    ...actual,
    isCheckoutLegalReady: mocks.isCheckoutLegalReady,
  };
});

import { LEGAL_PUBLICATION_BLOCK_MESSAGE } from "@/lib/legal/publication";
import { createCheckoutSession } from "@/lib/stripe/create-checkout-session";

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

const completeShop = {
  name: "Tilouki",
  tagline: "",
  description: "",
  legalName: "Marie Dupont",
  legalStatus: "AE",
  siret: "12345678901234",
  address: "Paris",
  phone: "0600000000",
  contactEmail: "a@b.fr",
  mediationName: "Med",
  mediationUrl: "https://med.fr",
  hostName: "Vercel",
  hostAddress: "US",
  hostEmail: "h@vercel.com",
  returnPolicy: "Retours 14j",
  primaryColor: "",
  minShippingCents: 490,
  categories: [],
};

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  mocks.validateCartStock.mockResolvedValue({ valid: true });
  mocks.validateRelayPointDetailed.mockResolvedValue({ valid: true });
  mocks.findStorefrontBlockedSlugInCheckoutItems.mockResolvedValue(null);
  mocks.findDevSeedSlugInCheckoutItems.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("createCheckoutSession — conformité légale", () => {
  it("bloque le checkout en production si les paramètres légaux sont incomplets", async () => {
    mocks.getShopSettings.mockResolvedValue({ ...completeShop, siret: null });
    mocks.isCheckoutLegalReady.mockResolvedValue(false);

    await expect(createCheckoutSession(checkoutInput)).rejects.toMatchObject({
      message: LEGAL_PUBLICATION_BLOCK_MESSAGE,
      status: 503,
      expose: true,
    });
  });

  it("autorise le checkout en production si les paramètres légaux sont complets", async () => {
    mocks.getShopSettings.mockResolvedValue(completeShop);
    mocks.isCheckoutLegalReady.mockResolvedValue(true);
    mocks.createPendingOrder.mockRejectedValue(new Error("stop-after-legal-check"));

    await expect(createCheckoutSession(checkoutInput)).rejects.toThrow(
      "stop-after-legal-check",
    );
  });
});
