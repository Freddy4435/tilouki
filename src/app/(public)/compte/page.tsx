import type { Metadata } from "next";

import { CustomerAccountPanel } from "@/components/account/customer-account-panel";
import { FavoritesSyncOnLogin } from "@/components/account/favorites-sync-on-login";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { getCustomerAuthUser } from "@/lib/account/customer-favorites-service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default async function ComptePage() {
  const user = isSupabaseConfigured() ? await getCustomerAuthUser() : null;

  return (
    <div className="container-tilouki section-tilouki max-w-lg">
      <header className="border-tilouki-powder/30 bg-tilouki-powder-soft/40 mb-6 space-y-3 rounded-2xl border p-5">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Mon compte</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Connexion légère par e-mail pour retrouver vos favoris sur mobile, tablette et
          ordinateur — sans créer de mot de passe.
        </p>
        <ReassuranceStrip variant="compact" className="justify-start" />
      </header>

      <div className="bg-card rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)]">
        <CustomerAccountPanel email={user?.email ?? null} />
      </div>

      <FavoritesSyncOnLogin isAuthenticated={Boolean(user)} />
    </div>
  );
}
