import "server-only";

import type Stripe from "stripe";

import { sendPaymentFailedEmail } from "@/lib/email";
import {
  getOrderById,
  getOrderByPaymentIntentId,
  markOrderPaymentFailed,
} from "@/lib/supabase/queries/orders";
import { logStripeWebhook } from "@/lib/stripe/webhook/logger";

export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string,
): Promise<void> {
  const orderId = paymentIntent.metadata?.order_id;

  logStripeWebhook("info", "Traitement payment_intent.payment_failed", {
    eventId,
    orderId,
    paymentIntentId: paymentIntent.id,
    lastError: paymentIntent.last_payment_error?.message,
  });

  let resolvedOrderId: string | undefined = orderId;

  if (!resolvedOrderId) {
    const order = await getOrderByPaymentIntentId(paymentIntent.id);
    resolvedOrderId = order?.id;
  }

  if (!resolvedOrderId) {
    logStripeWebhook("warn", "payment_intent.payment_failed sans commande associée", {
      eventId,
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  const updated = await markOrderPaymentFailed(resolvedOrderId);

  if (updated) {
    logStripeWebhook("info", "Commande marquée en échec de paiement", {
      eventId,
      orderId: resolvedOrderId,
    });

    const order = await getOrderById(resolvedOrderId);
    if (order) {
      try {
        await sendPaymentFailedEmail(order, {
          reason: paymentIntent.last_payment_error?.message ?? null,
        });
      } catch (error) {
        logStripeWebhook("error", "Échec envoi e-mail paiement refusé", {
          eventId,
          orderId: resolvedOrderId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } else {
    logStripeWebhook("info", "Échec paiement déjà enregistré ou commande non pending", {
      eventId,
      orderId: resolvedOrderId,
    });
  }
}
