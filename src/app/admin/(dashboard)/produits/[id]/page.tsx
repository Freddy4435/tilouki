import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories } from "@/lib/supabase/queries/admin/categories";
import { getAdminProduct } from "@/lib/supabase/queries/admin/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return {
    title: product ? `Éditer — ${product.name}` : "Produit",
    robots: { index: false, follow: false },
  };
}

export default async function AdminProduitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        title={product.name}
        description={`Slug : ${product.slug}`}
      />

      <ProductForm
        product={product}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
