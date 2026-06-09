import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { CataloguePagination } from "@/components/catalogue/catalogue-pagination";
import { CatalogueToolbar } from "@/components/catalogue/catalogue-toolbar";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { parseCatalogueQuery } from "@/lib/catalog/parse-catalogue-query";
import { getCategorySeoDescription } from "@/lib/seo/copy";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl, buildCanonicalFromSearchParams, buildPageMetadata } from "@/lib/seo/metadata";
import { getCategoryBySlug } from "@/lib/supabase/queries/categories";
import { getActiveProductsPaginated } from "@/lib/supabase/queries/products";

export const revalidate = 300;

const CATEGORY_CANONICAL_KEYS = ["genre", "saison", "tri", "page", "prix_min", "prix_max"];

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };

  const canonicalPath = buildCanonicalFromSearchParams(
    `/categorie/${slug}`,
    resolved,
    CATEGORY_CANONICAL_KEYS,
  );

  return buildPageMetadata({
    title: `${category.name} — vêtements enfants`,
    description: getCategorySeoDescription(category),
    path: canonicalPath,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const query = { ...parseCatalogueQuery(resolvedSearch), categorySlug: slug };
  const result = await getActiveProductsPaginated(query);

  const flatParams = {
    ...Object.fromEntries(
      Object.entries(resolvedSearch).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
    ),
    categorie: slug,
  };

  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Catalogue", path: "/catalogue" },
    { name: category.name, path: `/categorie/${slug}` },
  ];

  const itemListJsonLd =
    result.items.length > 0
      ? buildItemListJsonLd(
          result.items.map((product) => ({
            name: product.name,
            url: absoluteUrl(`/produit/${product.slug}`),
          })),
        )
      : null;

  return (
    <div className="container-tilouki section-tilouki">
      <JsonLdScript
        data={[
          buildBreadcrumbJsonLd(breadcrumbs),
          ...(itemListJsonLd ? [itemListJsonLd] : []),
        ]}
      />

      <Breadcrumbs items={breadcrumbs} className="mb-4" />

      <header className="mb-8">
        <p className="text-muted-foreground text-sm">Catégorie</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{category.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          {getCategorySeoDescription(category)}
        </p>
      </header>

      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <CatalogueToolbar
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
        />
        <CatalogueProductList
          products={result.items}
          emptyTitle="Aucun produit dans cette catégorie"
          emptyDescription="Revenez bientôt ou explorez une autre catégorie."
        />
        <CataloguePagination
          page={result.page}
          totalPages={result.totalPages}
          searchParams={flatParams}
          basePath={`/categorie/${slug}`}
        />
      </Suspense>
    </div>
  );
}
