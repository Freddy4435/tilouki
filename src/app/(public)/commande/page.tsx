import type { Metadata } from "next";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { getRequestCspNonce } from "@/lib/security/request-nonce";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false, follow: false },
};

/** Nonce CSP requis pour le widget Mondial Relay (scripts tiers). */
export const dynamic = "force-dynamic";

export default async function CommandePage() {
  const nonce = await getRequestCspNonce();

  return (
    <CheckoutShell>
      <CheckoutFlow nonce={nonce} />
    </CheckoutShell>
  );
}
