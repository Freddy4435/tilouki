import "server-only";

import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";

export interface CreateStripeRefundInput {
  paymentIntentId: string;
  /** Montant en centimes — omis = remboursement intégral du PaymentIntent. */
  amountCents?: number;
  reason?: Stripe.RefundCreateParams.Reason;
  metadata?: Record<string, string>;
}

export interface CreateStripeRefundResult {
  refundId: string;
  amountCents: number;
  status: string | null;
}

export async function createStripeRefund(
  input: CreateStripeRefundInput,
): Promise<CreateStripeRefundResult> {
  const stripe = getStripeClient();

  const refund = await stripe.refunds.create({
    payment_intent: input.paymentIntentId,
    amount: input.amountCents,
    reason: input.reason ?? "requested_by_customer",
    metadata: input.metadata,
  });

  return {
    refundId: refund.id,
    amountCents: refund.amount,
    status: refund.status,
  };
}
