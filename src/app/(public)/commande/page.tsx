import type { Metadata } from "next";
import { headers } from "next/headers";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { CheckoutShell } from "@/components/checkout/checkout-shell";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false, follow: false },
};

export default async function CommandePage() {
  // Nonce CSP transmis aux <Script> du widget Mondial Relay (jQuery + carte).
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <CheckoutShell>
      <CheckoutFlow nonce={nonce} />
    </CheckoutShell>
  );
}
