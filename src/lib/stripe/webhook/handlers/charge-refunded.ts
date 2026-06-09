import "server-only";

import type Stripe from "stripe";

import {
  getOrderByPaymentIntentId,
  markOrderRefunded,
  restoreStockAfterRefund,
} from "@/lib/supabase/queries/orders";
import { logStripeWebhook } from "@/lib/stripe/webhook/logger";

function extractPaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null,
): string | null {
  if (!paymentIntent) return null;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export async function handleChargeRefunded(charge: Stripe.Charge, eventId: string): Promise<void> {
  const paymentIntentId = extractPaymentIntentId(charge.payment_intent);

  logStripeWebhook("info", "Traitement charge.refunded", {
    eventId,
    chargeId: charge.id,
    paymentIntentId,
    amountRefunded: charge.amount_refunded,
  });

  if (!paymentIntentId) {
    logStripeWebhook("warn", "charge.refunded sans payment_intent", {
      eventId,
      chargeId: charge.id,
    });
    return;
  }

  const order = await getOrderByPaymentIntentId(paymentIntentId);

  if (!order) {
    logStripeWebhook("warn", "charge.refunded — commande introuvable", {
      eventId,
      paymentIntentId,
    });
    return;
  }

  if (order.payment_status === "refunded") {
    logStripeWebhook("info", "Remboursement déjà traité (idempotent)", {
      eventId,
      orderId: order.id,
    });
    return;
  }

  const isFullRefund = charge.refunded && charge.amount_refunded >= charge.amount;
  if (!isFullRefund) {
    logStripeWebhook("info", "Remboursement partiel — stock non restauré", {
      eventId,
      orderId: order.id,
      amountRefunded: charge.amount_refunded,
      amount: charge.amount,
    });
    return;
  }

  const updated = await markOrderRefunded(order.id);

  if (!updated) {
    logStripeWebhook("warn", "Impossible de marquer la commande remboursée", {
      eventId,
      orderId: order.id,
      status: order.status,
      paymentStatus: order.payment_status,
    });
    return;
  }

  await restoreStockAfterRefund(order.id);

  logStripeWebhook("info", "Remboursement traité et stock restauré", {
    eventId,
    orderId: order.id,
    orderNumber: order.order_number,
  });
}
