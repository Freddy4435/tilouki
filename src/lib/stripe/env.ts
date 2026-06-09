export function isStripeServerConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

/** Clé publique Stripe — utilisable côté client si besoin (Elements, etc.). */
export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || undefined;
}

export function isStripePublishableConfigured(): boolean {
  return Boolean(getStripePublishableKey());
}
