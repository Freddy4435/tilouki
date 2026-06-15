import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories } from "@/lib/supabase/queries/admin/categories";

export const metadata: Metadata = {
  title: "Nouveau produit",
  robots: { index: false, follow: false },
};

export default async function AdminNouveauProduitPage() {
  const categories = await listAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Nouveau produit"
        description="Créez un produit avec sa première variante."
      />
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
