import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminShopSettings } from "@/lib/supabase/queries/admin/settings";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

export default async function AdminParametresPage() {
  const settings = await getAdminShopSettings();

  return (
    <>
      <AdminPageHeader
        title="Paramètres"
        description="Informations légales, TVA et coordonnées de la boutique."
      />

      {settings ? (
        <SettingsForm settings={settings} />
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Aucun paramètre boutique trouvé. Exécutez les migrations Supabase.
          </CardContent>
        </Card>
      )}
    </>
  );
}
