import { LegalComplianceBanner } from "@/components/admin/legal-compliance-banner";
import { loadAdminLegalComplianceInput } from "@/lib/admin/legal-compliance-context.server";
import { getLegalComplianceSummary } from "@/lib/legal/compliance";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import { requireAdmin } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  const settings = await getAdminShopSettings();
  const complianceInput = await loadAdminLegalComplianceInput(settings);

  const legalBannerActive =
    complianceInput &&
    !getLegalComplianceSummary(complianceInput, { includeInfrastructure: false })
      .isComplete;

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminMobileNav />
        {legalBannerActive ? (
          <LegalComplianceBanner settings={complianceInput} />
        ) : null}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
