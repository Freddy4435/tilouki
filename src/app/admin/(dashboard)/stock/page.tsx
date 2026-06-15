import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
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
  listAdminLowStock,
  listAdminStockMovements,
} from "@/lib/supabase/queries/admin/stock";

export const metadata: Metadata = {
  title: "Stock",
  robots: { index: false, follow: false },
};

const MOVEMENT_LABELS: Record<string, string> = {
  sale: "Vente",
  restock: "Réapprovisionnement",
  adjustment: "Ajustement",
  return: "Retour",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminStockPage() {
  const [lowStock, movements] = await Promise.all([
    listAdminLowStock(),
    listAdminStockMovements(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Stock"
        description="Surveillez les niveaux de stock et l'historique des mouvements."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock faible (≤ 3)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      Aucune alerte stock.
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStock.map((item) => (
                    <TableRow key={item.variantId}>
                      <TableCell>
                        <Link
                          href={`/admin/produits/${item.productId}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {item.productName}
                        </Link>
                        {(item.sizeLabel || item.ageLabel) && (
                          <div className="text-muted-foreground text-xs">
                            {[item.sizeLabel, item.ageLabel]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={item.stockQuantity === 0 ? "destructive" : "outline"}
                        >
                          {item.stockQuantity}
                        </Badge>
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
            <CardTitle className="text-base">Derniers mouvements</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      Aucun mouvement enregistré.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(movement.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {movement.productName}
                        </div>
                        <div className="text-muted-foreground font-mono text-xs">
                          {movement.sku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {MOVEMENT_LABELS[movement.type] ?? movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {movement.quantity > 0
                          ? `+${movement.quantity}`
                          : movement.quantity}
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
