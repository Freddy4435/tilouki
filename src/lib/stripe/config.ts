/** Devise unique de la boutique — montants toujours en centimes. */
export const STRIPE_CURRENCY = "eur" as const;

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SITE_URL est requis pour Stripe Checkout.");
  }
  return url.replace(/\/$/, "");
}

export function getCheckoutSuccessUrl(): string {
  return `${getSiteUrl()}/commande/succes?session_id={CHECKOUT_SESSION_ID}`;
}

export function getCheckoutCancelUrl(): string {
  return `${getSiteUrl()}/commande/echec`;
}
