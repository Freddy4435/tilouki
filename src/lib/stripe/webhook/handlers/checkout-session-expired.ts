import "server-only";

import type Stripe from "stripe";

import { markOrderPaymentFailed } from "@/lib/supabase/queries/orders";
import { logStripeWebhook } from "@/lib/stripe/webhook/logger";

export async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    logStripeWebhook("warn", "checkout.session.expired sans order_id", { eventId });
    return;
  }

  const updated = await markOrderPaymentFailed(orderId);

  logStripeWebhook(
    updated ? "info" : "info",
    updated
      ? "Session expirée — commande annulée et stock libéré"
      : "Session expirée — commande déjà traitée ou non pending",
    { eventId, orderId },
  );
}
