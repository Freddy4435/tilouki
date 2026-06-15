import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LegalComplianceChecklist } from "@/components/admin/legal-compliance-checklist";
import {
  ProductionReadinessBanner,
  ProductionReadinessChecklist,
} from "@/components/admin/production-readiness-checklist";
import { loadAdminLegalComplianceInput } from "@/lib/admin/legal-compliance-context.server";
import { getProductionReadinessSummary } from "@/lib/admin/production-readiness.server";
import { getAdminShopSettings } from "@/lib/supabase/queries/admin/settings";

export const metadata: Metadata = {
  title: "Préparation mise en ligne",
  robots: { index: false, follow: false },
};

export default async function AdminPreparationPage() {
  const [summary, settings] = await Promise.all([
    getProductionReadinessSummary(),
    getAdminShopSettings(),
  ]);
  const complianceInput = await loadAdminLegalComplianceInput(settings);

  return (
    <>
      <AdminPageHeader
        title="Préparation mise en ligne"
        description="Vue d'ensemble avant d'encaisser en production : données boutique, catalogue et variables d'environnement."
      />

      <ProductionReadinessBanner summary={summary} />
      <div className="mb-8">
        <LegalComplianceChecklist settings={complianceInput} shopFieldsOnly />
      </div>
      <ProductionReadinessChecklist summary={summary} />
    </>
  );
}
