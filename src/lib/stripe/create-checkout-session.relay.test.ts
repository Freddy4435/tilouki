import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  validateCartStock: vi.fn(),
  validateRelayPointDetailed: vi.fn(),
  createPendingOrder: vi.fn(),
  fetchOrderLineItems: vi.fn(),
  updateOrderStripeSession: vi.fn(),
  markOrderPaymentFailed: vi.fn(),
  getStripeClient: vi.fn(),
  buildStripeCheckoutLineItems: vi.fn(),
  isShippingConfiguredForCheckout: vi.fn(() => true),
  getShippingConfigurationError: vi.fn(() => "Configuration requise."),
}));

vi.mock("@/lib/supabase/queries/cart", () => ({
  validateCartStock: mocks.validateCartStock,
}));

vi.mock("@/lib/shipping/validate-relay", () => ({
  validateRelayPointDetailed: mocks.validateRelayPointDetailed,
  RELAY_VALIDATION_UNAVAILABLE_MESSAGE:
    "Vérification du point relais momentanément indisponible, réessayez.",
}));

vi.mock("@/lib/shipping/checkout", () => ({
  isShippingConfiguredForCheckout: mocks.isShippingConfiguredForCheckout,
  getShippingConfigurationError: mocks.getShippingConfigurationError,
}));

vi.mock("@/lib/supabase/queries/orders", () => ({
  createPendingOrder: mocks.createPendingOrder,
  markOrderPaymentFailed: mocks.markOrderPaymentFailed,
  updateOrderStripeSession: mocks.updateOrderStripeSession,
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
  getStripeClient: mocks.getStripeClient,
}));

vi.mock("@/lib/stripe/line-items", () => ({
  buildStripeCheckoutLineItems: mocks.buildStripeCheckoutLineItems,
}));

vi.mock("@/lib/security/log", () => ({
  logSecure: vi.fn(),
}));

import { createCheckoutSession } from "@/lib/stripe/create-checkout-session";

const checkoutInput = {
  customer: {
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie@example.com",
    phone: "0612345678",
  },
  relayPoint: {
    id: "012417",
    name: "BODHI TELECOM",
    address: "2 RUE DE MULHOUSE",
    zip: "75002",
    city: "PARIS",
    country: "FR",
  },
  items: [{ variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 }],
  carrier: "mondial_relay" as const,
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://tilouki.test");
  mocks.validateCartStock.mockResolvedValue({ valid: true });
  mocks.isShippingConfiguredForCheckout.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("createCheckoutSession — point relais", () => {
  it("refuse le paiement sans point relais valide (validation serveur)", async () => {
    mocks.validateRelayPointDetailed.mockResolvedValue({
      valid: false,
      error: "Point relais introuvable. Sélectionnez-en un autre.",
    });

    await expect(createCheckoutSession(checkoutInput)).rejects.toMatchObject({
      message: "Point relais introuvable. Sélectionnez-en un autre.",
    });
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
  });

  it("refuse les points mock en production (validation serveur)", async () => {
    mocks.validateRelayPointDetailed.mockResolvedValue({
      valid: false,
      error: "Les points relais de développement ne sont pas autorisés en production.",
    });

    await expect(
      createCheckoutSession({
        ...checkoutInput,
        relayPoint: {
          ...checkoutInput.relayPoint,
          id: "DEV-MR-75002-01",
        },
      }),
    ).rejects.toMatchObject({
      message: "Les points relais de développement ne sont pas autorisés en production.",
    });
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
  });

  it("refuse un point relais incomplet avant Stripe", async () => {
    mocks.validateRelayPointDetailed.mockResolvedValue({
      valid: false,
      error: "Point relais incomplet. Sélectionnez un point relais valide.",
    });

    await expect(
      createCheckoutSession({
        ...checkoutInput,
        relayPoint: { ...checkoutInput.relayPoint, id: "" },
      }),
    ).rejects.toMatchObject({
      message: "Point relais incomplet. Sélectionnez un point relais valide.",
    });
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
  });

  it("crée la session Stripe quand le point relais est valide", async () => {
    mocks.validateRelayPointDetailed.mockResolvedValue({ valid: true });
    mocks.createPendingOrder.mockResolvedValue({
      id: "order-1",
      orderNumber: "TIL-001",
      currency: "EUR",
      shippingCents: 490,
      discountCents: 0,
      totalCents: 5490,
    });
    mocks.buildStripeCheckoutLineItems.mockReturnValue([{ price_data: {}, quantity: 1 }]);
    mocks.getStripeClient.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_1",
            url: "https://checkout.stripe.com/test",
          }),
        },
      },
    });

    const result = await createCheckoutSession(checkoutInput);

    expect(result.url).toBe("https://checkout.stripe.com/test");
    expect(mocks.validateRelayPointDetailed).toHaveBeenCalledWith(
      checkoutInput.relayPoint,
      "mondial_relay",
    );
    expect(mocks.createPendingOrder).toHaveBeenCalledOnce();
  });
});
