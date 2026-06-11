import type { Metadata } from "next";
import Link from "next/link";

import { AdminDashboardAlerts } from "@/components/admin/admin-dashboard-alerts";
import { AdminDashboardCta } from "@/components/admin/admin-dashboard-cta";
import { AdminDashboardPriorities } from "@/components/admin/admin-dashboard-priorities";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { OrderStatusBadge, ProductStatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildAdminConfigurationAlerts,
  buildAdminDashboardPriorities,
} from "@/lib/admin/dashboard-alerts";
import { buildAdminDashboardAlertContext } from "@/lib/admin/dashboard-config";
import { getAdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import {
  getAdminDashboardStats,
  getAdminRecentOrders,
  getAdminRecentProducts,
} from "@/lib/supabase/queries/admin/dashboard";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus, ProductStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const [stats, recentProducts, recentOrders, settings] = await Promise.all([
    getAdminDashboardStats(),
    getAdminRecentProducts(),
    getAdminRecentOrders(),
    getAdminShopSettings(),
  ]);

  const alertContext = await buildAdminDashboardAlertContext(settings, stats);
  const alerts = buildAdminConfigurationAlerts(alertContext);

  const priorities = buildAdminDashboardPriorities({
    ordersToPrepare: stats.ordersToPrepare,
    paidNotShippedCount: stats.paidNotShippedCount,
    lowStockCount: stats.lowStockCount,
    alerts,
    activeProductCount: stats.activeProductCount,
  });

  const monthLabel = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="Votre liste de tâches pour faire tourner la boutique."
        actions={<AdminDashboardCta />}
      />

      <AdminDashboardPriorities priorities={priorities} />
      <AdminDashboardAlerts alerts={alerts} />

      <section className="mb-8" aria-label="Indicateurs du mois">
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Activité — {monthLabel}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Chiffre d'affaires"
            value={stats.monthlyRevenueLabel}
            description={`${stats.monthlyOrderCount} commande${stats.monthlyOrderCount > 1 ? "s" : ""} payée${stats.monthlyOrderCount > 1 ? "s" : ""}`}
          />
          <AdminStatCard
            title="Commandes du mois"
            value={String(stats.monthlyOrderCount)}
            description="Commandes payées ce mois-ci"
            href="/admin/commandes?payment=paid"
          />
          <AdminStatCard
            title="À préparer"
            value={String(stats.ordersToPrepare)}
            description="Payées, en attente de préparation"
            href="/admin/commandes?status=paid"
            tone={stats.ordersToPrepare > 0 ? "warning" : "default"}
          />
          <AdminStatCard
            title="Non expédiées"
            value={String(stats.paidNotShippedCount)}
            description="Payées, pas encore expédiées"
            href="/admin/commandes?status=preparing"
            tone={stats.paidNotShippedCount > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      <section className="mb-8" aria-label="Catalogue et stock">
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Catalogue & stock
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Produits actifs"
            value={String(stats.activeProductCount)}
            description="Visibles sur le site"
            href="/admin/produits"
            tone={stats.activeProductCount === 0 ? "warning" : "default"}
          />
          <AdminStatCard
            title="Stock faible"
            value={String(stats.lowStockCount)}
            description="Variantes ≤ 3 unités"
            href="/admin/stock"
            tone={stats.lowStockCount > 0 ? "warning" : "default"}
          />
          <AdminStatCard
            title="Sans photo"
            value={String(stats.productsWithoutPhotoCount)}
            description="Produits sans image"
            href="/admin/produits"
            tone={stats.productsWithoutPhotoCount > 0 ? "warning" : "default"}
          />
          <AdminStatCard
            title="Sans stock"
            value={String(stats.productsWithoutStockCount)}
            description="Produits actifs à zéro"
            href="/admin/stock"
            tone={stats.productsWithoutStockCount > 0 ? "warning" : "default"}
          />
        </div>
        {stats.productsWithoutWeightCount > 0 ? (
          <p className="text-muted-foreground mt-3 text-sm">
            {stats.productsWithoutWeightCount} produit
            {stats.productsWithoutWeightCount > 1 ? "s" : ""} avec variante(s) sans poids —{" "}
            <Link href="/admin/produits" className="text-primary font-medium underline">
              compléter les fiches
            </Link>
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Dernières commandes</CardTitle>
            <Link href="/admin/commandes" className="text-primary text-sm font-medium hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                      Aucune commande
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <Link
                            href={`/admin/commandes/${order.id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-muted-foreground text-xs">
                            {formatShortDate(order.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status as OrderStatus} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(order.totalCents)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Derniers produits ajoutés</CardTitle>
            <Link href="/admin/produits" className="text-primary text-sm font-medium hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Ajouté</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground py-8 text-center">
                      Aucun produit —{" "}
                      <Link href="/admin/produits/nouveau" className="text-primary underline">
                        créer le premier
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link
                          href={`/admin/produits/${product.id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <ProductStatusBadge status={product.status as ProductStatus} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-xs">
                        {formatShortDate(product.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
