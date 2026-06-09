import "server-only";

import type Stripe from "stripe";

import { handleChargeRefunded } from "@/lib/stripe/webhook/handlers/charge-refunded";
import { handleCheckoutSessionCompleted } from "@/lib/stripe/webhook/handlers/checkout-session-completed";
import { handleCheckoutSessionExpired } from "@/lib/stripe/webhook/handlers/checkout-session-expired";
import { handlePaymentIntentFailed } from "@/lib/stripe/webhook/handlers/payment-intent-failed";
import {
  claimStripeWebhookEvent,
  isStripeWebhookEventProcessed,
} from "@/lib/stripe/webhook/idempotence";
import { logStripeWebhook } from "@/lib/stripe/webhook/logger";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.payment_failed",
  "charge.refunded",
]);

export async function processStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  logStripeWebhook("info", "Événement reçu", {
    eventId: event.id,
    eventType: event.type,
  });

  if (!HANDLED_EVENTS.has(event.type)) {
    logStripeWebhook("info", "Événement ignoré", {
      eventId: event.id,
      eventType: event.type,
    });
    return;
  }

  if (await isStripeWebhookEventProcessed(event.id)) {
    logStripeWebhook("info", "Événement déjà traité (idempotent)", {
      eventId: event.id,
      eventType: event.type,
    });
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.id,
      );
      break;

    case "checkout.session.expired":
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session, event.id);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, event.id);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge, event.id);
      break;
  }

  await claimStripeWebhookEvent(event.id, event.type);
}
