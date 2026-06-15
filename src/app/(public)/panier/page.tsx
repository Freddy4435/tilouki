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
      <header className="border-tilouki-jade/30 bg-tilouki-jade-soft/40 mb-6 space-y-3 rounded-2xl border p-5 sm:mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Votre panier</h1>
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
