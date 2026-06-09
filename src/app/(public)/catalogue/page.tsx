import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { CataloguePagination } from "@/components/catalogue/catalogue-pagination";
import { CatalogueToolbar } from "@/components/catalogue/catalogue-toolbar";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { parseCatalogueQuery } from "@/lib/catalog/parse-catalogue-query";
import { buildItemListJsonLd } from "@/lib/seo/json-ld";
import { CATALOGUE_SEO_DESCRIPTION } from "@/lib/seo/copy";
import { absoluteUrl, buildCanonicalFromSearchParams, buildPageMetadata } from "@/lib/seo/metadata";
import { getCategories } from "@/lib/supabase/queries/categories";
import { getActiveProductsPaginated } from "@/lib/supabase/queries/products";
import { getShopSettings } from "@/lib/supabase/queries/shop";

export const revalidate = 300;

const CATALOGUE_CANONICAL_KEYS = [
  "q",
  "categorie",
  "genre",
  "saison",
  "tri",
  "page",
  "prix_min",
  "prix_max",
  "promo",
];

interface CataloguePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: CataloguePageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const { name } = await getShopSettings();
  const canonicalPath = buildCanonicalFromSearchParams(
    "/catalogue",
    resolved,
    CATALOGUE_CANONICAL_KEYS,
  );

  const hasActiveFilters = Object.entries(resolved).some(([key, raw]) => {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value?.trim()) return false;
    if (key === "page" && value.trim() === "1") return false;
    return CATALOGUE_CANONICAL_KEYS.includes(key);
  });

  return buildPageMetadata({
    title: "Catalogue vêtements enfants",
    description: CATALOGUE_SEO_DESCRIPTION.replace("Tilouki", name),
    path: canonicalPath,
    noIndex: hasActiveFilters,
  });
}

async function CatalogueContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = parseCatalogueQuery(searchParams);
  const result = await getActiveProductsPaginated(query);

  const flatParams = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

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
    <>
      {itemListJsonLd ? <JsonLdScript data={itemListJsonLd} /> : null}
      <CatalogueToolbar
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
      />
      <CatalogueProductList
        products={result.items}
        emptyTitle="Aucun produit trouvé"
        emptyDescription="Modifiez vos filtres ou revenez plus tard."
      />
      <CataloguePagination
        page={result.page}
        totalPages={result.totalPages}
        searchParams={flatParams}
      />
    </>
  );
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const resolvedParams = await searchParams;
  const categories = await getCategories();

  return (
    <div className="container-tilouki section-tilouki">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Catalogue vêtements enfants
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Tee-shirts, sweats et essentiels fille et garçon. Filtrez par taille, catégorie et prix,
          avec livraison en point relais.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Filtres du catalogue">
          <Suspense fallback={<div className="bg-muted h-64 animate-pulse rounded-2xl" />}>
            <CatalogueFilters categories={categories} />
          </Suspense>
        </aside>

        <div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <CatalogueContent searchParams={resolvedParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
