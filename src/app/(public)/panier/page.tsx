import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { getActiveProducts } from "@/lib/supabase/queries/products";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: false },
};

export default async function PanierPage() {
  const recommendations = await getActiveProducts({ limit: 4 });

  return (
    <div className="container-tilouki section-tilouki">
      <header className="mb-6 space-y-3 rounded-2xl border border-tilouki-sage/15 bg-gradient-to-br from-tilouki-sage-light/30 via-card to-tilouki-blue-soft/20 p-5 sm:mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Votre panier</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Vérifiez tailles et quantités — stock contrôlé avant paiement sécurisé.
          </p>
        </div>
        <ReassuranceStrip variant="compact" className="justify-start" />
      </header>
      <CartView recommendations={recommendations} />
    </div>
  );
}
