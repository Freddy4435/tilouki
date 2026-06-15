import type { Metadata } from "next";

import { FavoritesView } from "@/components/favorites/favorites-view";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";

export const metadata: Metadata = {
  title: "Mes favoris",
  robots: { index: false, follow: false },
};

export default function FavorisPage() {
  return (
    <div className="container-tilouki section-tilouki">
      <header className="border-tilouki-powder/30 bg-tilouki-powder-soft/40 mb-6 space-y-3 rounded-2xl border p-5 sm:mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Mes favoris</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Retrouvez les articles que vous avez enregistrés — tailles, stock et prix à
            jour.
          </p>
        </div>
        <ReassuranceStrip variant="compact" className="justify-start" />
      </header>
      <FavoritesView />
    </div>
  );
}
