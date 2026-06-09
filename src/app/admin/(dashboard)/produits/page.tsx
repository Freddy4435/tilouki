import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminFilterSelect } from "@/components/admin/admin-filter-select";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRODUCT_STATUS_LABELS } from "@/lib/admin/status-labels";
import { listAdminProducts } from "@/lib/supabase/queries/admin/products";
import { formatPrice } from "@/lib/utils";
import type { ProductStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Produits",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminProduitsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const products = await listAdminProducts(params.q);
  const statusFilter = params.status as ProductStatus | undefined;
  const filtered = statusFilter
    ? products.filter((p) => p.status === statusFilter)
    : products;

  const statusOptions = (Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((s) => ({
    value: s,
    label: PRODUCT_STATUS_LABELS[s],
  }));

  return (
    <>
      <AdminPageHeader
        title="Produits"
        description="Gérez votre catalogue, variantes et stocks."
        actions={<ButtonLink href="/admin/produits/nouveau">Nouveau produit</ButtonLink>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Suspense>
          <AdminSearch placeholder="Rechercher un produit…" />
        </Suspense>
        <Suspense>
          <AdminFilterSelect paramName="status" options={statusOptions} placeholder="Statut" />
        </Suspense>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Prix min.</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center text-sm">
                  Aucun produit trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.categoryName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {product.minPriceCents != null ? formatPrice(product.minPriceCents) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{product.totalStock}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
