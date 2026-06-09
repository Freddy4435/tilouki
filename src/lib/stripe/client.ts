import "server-only";

import Stripe from "stripe";

import { isStripeServerConfigured } from "@/lib/stripe/env";

let stripeClient: Stripe | null = null;

/**
 * Client Stripe serveur (clé secrète).
 * Ne jamais importer dans un composant client.
 */
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY est requis.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeClient;
}

export function assertStripeConfigured(): void {
  if (!isStripeServerConfigured()) {
    throw new Error("STRIPE_SECRET_KEY est requis.");
  }
}
