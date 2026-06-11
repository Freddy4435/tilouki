import "server-only";

import type Stripe from "stripe";

import { sendOrderPaidEmails } from "@/lib/email";
import { fulfillPaidOrder } from "@/lib/supabase/queries/orders";
import { logStripeWebhook } from "@/lib/stripe/webhook/logger";

function extractPaymentIntentId(
  paymentIntent: Stripe.Checkout.Session["payment_intent"],
): string | null {
  if (!paymentIntent) return null;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    logStripeWebhook("warn", "checkout.session.completed sans order_id", { eventId });
    return;
  }

  if (session.payment_status !== "paid") {
    logStripeWebhook("info", "Session complétée mais paiement non finalisé", {
      eventId,
      orderId,
      paymentStatus: session.payment_status,
    });
    return;
  }

  const paymentIntentId = extractPaymentIntentId(session.payment_intent);
  const amountTotal = session.amount_total;

  logStripeWebhook("info", "Traitement checkout.session.completed", {
    eventId,
    orderId,
    paymentIntentId,
    amountTotal,
  });

  const result = await fulfillPaidOrder(orderId, paymentIntentId, amountTotal);

  if (result.status === "skipped") {
    logStripeWebhook("warn", "Fulfillment ignoré", {
      eventId,
      orderId,
      reason: result.reason,
    });
    return;
  }

  if (result.status === "already_fulfilled") {
    logStripeWebhook("info", "Commande déjà traitée (idempotent)", {
      eventId,
      orderId,
      orderNumber: result.order.order_number,
    });
    return;
  }

  logStripeWebhook("info", "Commande marquée payée (stock déjà réservé à la création pending)", {
    eventId,
    orderId,
    orderNumber: result.order.order_number,
  });

  try {
    await sendOrderPaidEmails(result.order);
    logStripeWebhook("info", "E-mails de confirmation envoyés", {
      eventId,
      orderId,
      orderNumber: result.order.order_number,
    });
  } catch (error) {
    logStripeWebhook("error", "Échec envoi e-mails commande payée (commande déjà traitée)", {
      eventId,
      orderId,
      orderNumber: result.order.order_number,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
