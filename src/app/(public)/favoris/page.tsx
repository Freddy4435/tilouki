import type { Metadata } from "next";
import Link from "next/link";

import { FavoritesSyncOnLogin } from "@/components/account/favorites-sync-on-login";
import { FavoritesShareButton } from "@/components/favorites/favorites-share-button";
import { FavoritesView } from "@/components/favorites/favorites-view";
import { GrowthPassportPanel } from "@/components/growth-passport/growth-passport-panel";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { getCustomerAuthUser } from "@/lib/account/customer-favorites-service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Mes favoris",
  robots: { index: false, follow: false },
};

export default async function FavorisPage() {
  const user = isSupabaseConfigured() ? await getCustomerAuthUser() : null;

  return (
    <div className="container-tilouki section-tilouki">
      <header className="border-tilouki-powder/30 bg-tilouki-powder-soft/40 mb-6 space-y-3 rounded-2xl border p-5 sm:mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Mes favoris</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Retrouvez vos articles enregistrés — tailles en stock et ruptures affichées
              clairement, prix à jour sur cet appareil.
              {user ? (
                <>
                  {" "}
                  Synchronisés avec votre compte{" "}
                  <span className="text-foreground font-medium">{user.email}</span>.
                </>
              ) : (
                <>
                  {" "}
                  <Link href="/compte" className="text-primary font-medium underline-offset-4 hover:underline">
                    Connectez-vous
                  </Link>{" "}
                  pour les retrouver sur tous vos appareils.
                </>
              )}
            </p>
          </div>
          <FavoritesShareButton />
        </div>
        <ReassuranceStrip variant="compact" className="justify-start" />
      </header>
      <GrowthPassportPanel className="mb-8" />
      <FavoritesView />
      <FavoritesSyncOnLogin isAuthenticated={Boolean(user)} />
    </div>
  );
}
