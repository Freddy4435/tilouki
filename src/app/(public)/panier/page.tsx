import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { getActiveProducts } from "@/lib/supabase/queries/products";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: false },
};

export default async function PanierPage() {
  const recommendations = await getActiveProducts({ limit: 4 });

  return (
    <div className="container-tilouki section-tilouki">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Panier</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Vérifiez vos articles avant de passer commande.
        </p>
      </header>
      <CartView recommendations={recommendations} />
    </div>
  );
}
