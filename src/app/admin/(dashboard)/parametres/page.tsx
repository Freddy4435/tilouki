import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { loadAdminLegalComplianceInput } from "@/lib/admin/legal-compliance-context.server";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminShopSettings } from "@/lib/supabase/queries/admin/settings";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

export default async function AdminParametresPage() {
  const settings = await getAdminShopSettings();
  const legalCompliance = await loadAdminLegalComplianceInput(settings);

  return (
    <>
      <AdminPageHeader
        title="Paramètres"
        description="Informations légales, TVA et coordonnées de la boutique."
      />

      {settings ? (
        <SettingsForm settings={settings} legalCompliance={legalCompliance} />
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Aucune fiche paramètres en base. Appliquez les migrations Supabase (
            <code className="text-xs">supabase db push</code>) — la migration{" "}
            <code className="text-xs">shop_settings_bootstrap</code> crée la ligne
            initiale. En local : <code className="text-xs">supabase db reset</code>.
          </CardContent>
        </Card>
      )}
    </>
  );
}
