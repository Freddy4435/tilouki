/**
 * Événements Stripe gérés par `/api/webhooks/stripe`.
 * À configurer sur l'endpoint Live du Dashboard Stripe.
 */
export const STRIPE_WEBHOOK_EVENT_TYPES = [
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.payment_failed",
  "charge.refunded",
] as const;

export type StripeWebhookEventType = (typeof STRIPE_WEBHOOK_EVENT_TYPES)[number];
