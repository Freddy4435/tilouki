import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogueActiveFilters } from "@/components/catalogue/catalogue-active-filters";
import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
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
  categories,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  categories: Awaited<ReturnType<typeof getCategories>>;
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
      <CatalogueActiveFilters categories={categories} />
      <CatalogueProductList
        products={result.items}
        emptyTitle="Aucun produit trouvé"
        emptyDescription="Essayez d'élargir vos critères ou parcourez toutes les catégories."
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
      <header className="mb-6 space-y-3 rounded-2xl border border-tilouki-blue/10 bg-gradient-to-br from-tilouki-blue-soft/30 via-card to-tilouki-sage-light/20 p-5 sm:mb-8 sm:p-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Catalogue vêtements enfants
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            {categories.length} catégories — tailles, stock et prix sur chaque carte. Livraison point
            relais, paiement sécurisé.
          </p>
        </div>
        <ReassuranceStrip variant="compact" className="justify-start" />
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Filtres du catalogue">
          <Suspense fallback={<div className="bg-muted h-64 animate-pulse rounded-2xl" />}>
            <CatalogueFilters categories={categories} />
          </Suspense>
        </aside>

        <div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <CatalogueContent searchParams={resolvedParams} categories={categories} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
