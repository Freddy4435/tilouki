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
      <header className="mx-auto mb-8 max-w-lg space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Suivi de commande</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Retrouvez le statut de votre colis — expédié depuis la France en point relais.
        </p>
      </header>
      <OrderTrackingForm action={trackOrderAction} />
    </div>
  );
}
