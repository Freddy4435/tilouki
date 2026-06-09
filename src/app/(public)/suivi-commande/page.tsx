import type { Metadata } from "next";

import { OrderTrackingForm } from "@/components/order/order-tracking-form";
import { trackOrderAction } from "@/server/actions/tracking";

export const metadata: Metadata = {
  title: "Suivi de commande",
  robots: { index: false, follow: false },
};

export default function SuiviCommandePage() {
  return (
    <div className="container-tilouki section-tilouki">
      <header className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Suivi de commande</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Entrez le numéro de suivi reçu par e-mail après votre achat.
        </p>
      </header>
      <OrderTrackingForm action={trackOrderAction} />
    </div>
  );
}
