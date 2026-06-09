import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdmin } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminMobileNav />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
