import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  handleCheckoutSessionCompleted: vi.fn(),
  handleCheckoutSessionExpired: vi.fn(),
  handlePaymentIntentFailed: vi.fn(),
  handleChargeRefunded: vi.fn(),
  tryBeginStripeWebhookEvent: vi.fn(),
  rollbackStripeWebhookEvent: vi.fn(),
}));

vi.mock("@/lib/stripe/webhook/handlers/checkout-session-completed", () => ({
  handleCheckoutSessionCompleted: mocks.handleCheckoutSessionCompleted,
}));

vi.mock("@/lib/stripe/webhook/handlers/checkout-session-expired", () => ({
  handleCheckoutSessionExpired: mocks.handleCheckoutSessionExpired,
}));

vi.mock("@/lib/stripe/webhook/handlers/payment-intent-failed", () => ({
  handlePaymentIntentFailed: mocks.handlePaymentIntentFailed,
}));

vi.mock("@/lib/stripe/webhook/handlers/charge-refunded", () => ({
  handleChargeRefunded: mocks.handleChargeRefunded,
}));

vi.mock("@/lib/stripe/webhook/idempotence", () => ({
  tryBeginStripeWebhookEvent: mocks.tryBeginStripeWebhookEvent,
  rollbackStripeWebhookEvent: mocks.rollbackStripeWebhookEvent,
}));

vi.mock("@/lib/stripe/webhook/logger", () => ({
  logStripeWebhook: vi.fn(),
}));

import { processStripeWebhookEvent } from "@/lib/stripe/webhook/process-event";

function makeEvent(type: string, object: object): Stripe.Event {
  return {
    id: `evt_${type}`,
    type,
    data: { object },
  } as Stripe.Event;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.tryBeginStripeWebhookEvent.mockResolvedValue(true);
});

describe("processStripeWebhookEvent", () => {
  it("ignore les événements non gérés", async () => {
    await processStripeWebhookEvent(makeEvent("customer.created", {}));

    expect(mocks.tryBeginStripeWebhookEvent).not.toHaveBeenCalled();
    expect(mocks.handleCheckoutSessionCompleted).not.toHaveBeenCalled();
  });

  it("délègue checkout.session.completed", async () => {
    const session = { id: "cs_1", metadata: { order_id: "ord_1" } };

    await processStripeWebhookEvent(makeEvent("checkout.session.completed", session));

    expect(mocks.handleCheckoutSessionCompleted).toHaveBeenCalledWith(
      session,
      "evt_checkout.session.completed",
    );
  });

  it("délègue checkout.session.expired", async () => {
    const session = { id: "cs_2" };

    await processStripeWebhookEvent(makeEvent("checkout.session.expired", session));

    expect(mocks.handleCheckoutSessionExpired).toHaveBeenCalledWith(
      session,
      "evt_checkout.session.expired",
    );
  });

  it("délègue payment_intent.payment_failed", async () => {
    const paymentIntent = { id: "pi_1" };

    await processStripeWebhookEvent(
      makeEvent("payment_intent.payment_failed", paymentIntent),
    );

    expect(mocks.handlePaymentIntentFailed).toHaveBeenCalledWith(
      paymentIntent,
      "evt_payment_intent.payment_failed",
    );
  });

  it("délègue charge.refunded", async () => {
    const charge = { id: "ch_1" };

    await processStripeWebhookEvent(makeEvent("charge.refunded", charge));

    expect(mocks.handleChargeRefunded).toHaveBeenCalledWith(
      charge,
      "evt_charge.refunded",
    );
  });

  it("est idempotent si l'événement a déjà été traité", async () => {
    mocks.tryBeginStripeWebhookEvent.mockResolvedValue(false);

    await processStripeWebhookEvent(
      makeEvent("checkout.session.completed", { id: "cs_3" }),
    );

    expect(mocks.handleCheckoutSessionCompleted).not.toHaveBeenCalled();
  });

  it("rollback en cas d'erreur handler", async () => {
    mocks.handleCheckoutSessionCompleted.mockRejectedValue(new Error("boom"));

    await expect(
      processStripeWebhookEvent(
        makeEvent("checkout.session.completed", { id: "cs_4" }),
      ),
    ).rejects.toThrow("boom");

    expect(mocks.rollbackStripeWebhookEvent).toHaveBeenCalledWith(
      "evt_checkout.session.completed",
    );
  });
});
