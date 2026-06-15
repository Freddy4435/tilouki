import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  validateCartStock: vi.fn(),
  validateRelayPointDetailed: vi.fn(),
  findStorefrontBlockedSlugInCheckoutItems: vi.fn(),
  findDevSeedSlugInCheckoutItems: vi.fn(),
  createPendingOrder: vi.fn(),
  isShippingConfiguredForCheckout: vi.fn(() => true),
  getShippingConfigurationError: vi.fn(() => "Configuration requise."),
}));

vi.mock("@/lib/supabase/queries/cart", () => ({
  validateCartStock: mocks.validateCartStock,
}));

vi.mock("@/lib/catalog/dev-seed-guard", () => ({
  findStorefrontBlockedSlugInCheckoutItems:
    mocks.findStorefrontBlockedSlugInCheckoutItems,
  findDevSeedSlugInCheckoutItems: mocks.findDevSeedSlugInCheckoutItems,
  DEV_SEED_CHECKOUT_BLOCKED_MESSAGE:
    "Ce panier contient des articles de démonstration qui ne peuvent pas être vendus en production. Retirez-les de votre panier ou contactez la boutique.",
}));

vi.mock("@/lib/shipping/validate-relay", () => ({
  validateRelayPointDetailed: mocks.validateRelayPointDetailed,
  RELAY_VALIDATION_UNAVAILABLE_MESSAGE: "Indisponible",
}));

vi.mock("@/lib/shipping/checkout", () => ({
  isShippingConfiguredForCheckout: mocks.isShippingConfiguredForCheckout,
  getShippingConfigurationError: mocks.getShippingConfigurationError,
}));

vi.mock("@/lib/supabase/queries/orders", () => ({
  createPendingOrder: mocks.createPendingOrder,
  markOrderPaymentFailed: vi.fn(),
  updateOrderStripeSession: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: async () => ({ data: [], error: null }),
      }),
    }),
  }),
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: vi.fn(),
}));

vi.mock("@/lib/stripe/line-items", () => ({
  buildStripeCheckoutLineItems: vi.fn(),
}));

vi.mock("@/lib/security/log", () => ({
  logSecure: vi.fn(),
}));

import { DEV_SEED_CHECKOUT_BLOCKED_MESSAGE } from "@/lib/catalog/dev-seed-guard";
import { StripeCheckoutError } from "@/lib/stripe/errors";
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

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  mocks.validateCartStock.mockResolvedValue({
    valid: true,
    items: [],
    messages: [],
    subtotalCents: 2500,
    shippingCents: 490,
    totalCents: 2990,
  });
  mocks.validateRelayPointDetailed.mockResolvedValue({ valid: true });
  mocks.findStorefrontBlockedSlugInCheckoutItems.mockResolvedValue(null);
  mocks.findDevSeedSlugInCheckoutItems.mockResolvedValue(null);
  mocks.createPendingOrder.mockResolvedValue({
    id: "order-1",
    orderNumber: "TLK-001",
    currency: "EUR",
    shippingCents: 490,
    discountCents: 0,
    totalCents: 2990,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("createCheckoutSession — produits démo en production", () => {
  it("refuse le checkout avec un message exposable si un slug démo est détecté", async () => {
    mocks.findStorefrontBlockedSlugInCheckoutItems.mockResolvedValue("pyjama-etoiles");

    await expect(createCheckoutSession(checkoutInput)).rejects.toMatchObject({
      message: DEV_SEED_CHECKOUT_BLOCKED_MESSAGE,
      status: 400,
      expose: true,
    });

    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
  });

  it("propage l'erreur exposable jusqu'à l'API route", async () => {
    mocks.findStorefrontBlockedSlugInCheckoutItems.mockResolvedValue("pyjama-etoiles");

    const error = await createCheckoutSession(checkoutInput).catch((e) => e);
    expect(error).toBeInstanceOf(StripeCheckoutError);
    expect((error as StripeCheckoutError).expose).toBe(true);
  });
});
