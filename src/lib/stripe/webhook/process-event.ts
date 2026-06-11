import "server-only";

import type Stripe from "stripe";

import { STRIPE_WEBHOOK_EVENT_TYPES } from "@/lib/stripe/webhook/events";
import { handleChargeRefunded } from "@/lib/stripe/webhook/handlers/charge-refunded";
import { handleCheckoutSessionCompleted } from "@/lib/stripe/webhook/handlers/checkout-session-completed";
import { handleCheckoutSessionExpired } from "@/lib/stripe/webhook/handlers/checkout-session-expired";
import { handlePaymentIntentFailed } from "@/lib/stripe/webhook/handlers/payment-intent-failed";
import {
  rollbackStripeWebhookEvent,
  tryBeginStripeWebhookEvent,
} from "@/lib/stripe/webhook/idempotence";
import { logStripeWebhook } from "@/lib/stripe/webhook/logger";

const HANDLED_EVENTS = new Set<string>(STRIPE_WEBHOOK_EVENT_TYPES);

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

  const begun = await tryBeginStripeWebhookEvent(event.id, event.type);
  if (!begun) {
    logStripeWebhook("info", "Événement déjà traité (idempotent)", {
      eventId: event.id,
      eventType: event.type,
    });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          event.id,
        );
        break;

      case "checkout.session.expired":
        await handleCheckoutSessionExpired(
          event.data.object as Stripe.Checkout.Session,
          event.id,
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
          event.id,
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge, event.id);
        break;
    }
  } catch (error) {
    await rollbackStripeWebhookEvent(event.id);
    throw error;
  }
}
