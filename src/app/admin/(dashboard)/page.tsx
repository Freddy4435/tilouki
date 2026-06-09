import type { Metadata } from "next";
import Link from "next/link";

import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { OrderStatusBadge, ProductStatusBadge } from "@/components/admin/status-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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

export default async function AdminDashboardPage() {
  const [stats, recentProducts, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    getAdminRecentProducts(),
    getAdminRecentOrders(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre boutique Tilouki."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="CA du mois"
          value={stats.monthlyRevenueLabel}
          description={`${stats.monthlyOrderCount} commande(s) payée(s)`}
        />
        <AdminStatCard
          title="À préparer"
          value={String(stats.ordersToPrepare)}
          description="Commandes payées"
        />
        <AdminStatCard
          title="Stock faible"
          value={String(stats.lowStockCount)}
          description="Variantes ≤ 3 unités"
        />
        <AdminStatCard
          title="Produits actifs"
          value={String(stats.activeProductCount)}
          description="Catalogue publié"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dernières commandes</CardTitle>
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
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
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
          <CardHeader>
            <CardTitle className="text-base">Derniers produits</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground py-8 text-center">
                      Aucun produit
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
