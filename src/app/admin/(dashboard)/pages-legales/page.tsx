import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LegalPageForm } from "@/components/admin/legal-page-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAdminLegalPages } from "@/lib/supabase/queries/admin/legal";

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
  const pages = await listAdminLegalPages();

  return (
    <>
      <AdminPageHeader
        title="Pages légales"
        description="Modèles HTML structurés, variables {{…}} et zones [À PERSONNALISER]. À valider par un professionnel du droit avant publication."
      />

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
