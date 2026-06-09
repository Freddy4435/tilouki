import type { CheckoutSessionInput } from "@/lib/validations/checkout";

/** Entrée acceptée par l'API — uniquement variantes + quantités, jamais de prix client. */
export type CreateCheckoutSessionInput = CheckoutSessionInput;

export interface CreateCheckoutSessionResult {
  /** URL Stripe Checkout hébergée — redirection immédiate côté client. */
  url: string;
  orderId: string;
  sessionId: string;
}
