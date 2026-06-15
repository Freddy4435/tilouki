import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LegalComplianceAlert } from "@/components/admin/legal-compliance-alert";
import { LegalComplianceChecklist } from "@/components/admin/legal-compliance-checklist";
import { LegalPagesBulkGenerate } from "@/components/admin/legal-pages-bulk-generate";
import { LegalPageForm } from "@/components/admin/legal-page-form";
import { LegalProfessionalNotice } from "@/components/admin/legal-professional-notice";
import { loadAdminLegalComplianceInput } from "@/lib/admin/legal-compliance-context.server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAdminLegalPages } from "@/lib/supabase/queries/admin/legal";
import { getAdminShopSettings } from "@/lib/supabase/queries/admin/settings";

export const metadata: Metadata = {
  title: "Pages légales",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function AdminPagesLegalesPage() {
  const [pages, settings] = await Promise.all([
    listAdminLegalPages(),
    getAdminShopSettings(),
  ]);

  const complianceInput = await loadAdminLegalComplianceInput(settings);

  return (
    <>
      <AdminPageHeader
        title="Pages légales"
        description="Textes structurés pour une boutique française. Variables {{…}} remplies depuis les paramètres. À valider par un professionnel du droit."
      />

      <div className="mb-6 space-y-4">
        <LegalProfessionalNotice />
        <LegalComplianceAlert settings={complianceInput} />
        <LegalPagesBulkGenerate />
        <LegalComplianceChecklist settings={complianceInput} shopFieldsOnly />
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Aucune page légale trouvée. Exécutez les migrations Supabase.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <CardTitle className="text-base">{page.title}</CardTitle>
                <p className="text-muted-foreground text-xs">
                  /{page.slug} — modifié le {formatDate(page.updatedAt)}
                </p>
              </CardHeader>
              <CardContent>
                <LegalPageForm page={page} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
