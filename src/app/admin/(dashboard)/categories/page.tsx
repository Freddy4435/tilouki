import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/category-form";
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
import { listAdminCategories } from "@/lib/supabase/queries/admin/categories";

export const metadata: Metadata = {
  title: "Catégories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Catégories"
        description="Organisez votre catalogue par catégories."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Ordre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-24 text-center text-sm"
                  >
                    Aucune catégorie.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {category.slug}
                    </TableCell>
                    <TableCell>{category.productCount}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {category.sortOrder}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nouvelle catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
