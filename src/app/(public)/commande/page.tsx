import type { Metadata } from "next";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { CheckoutShell } from "@/components/checkout/checkout-shell";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false, follow: false },
};

export default function CommandePage() {
  return (
    <CheckoutShell>
      <CheckoutFlow />
    </CheckoutShell>
  );
}
