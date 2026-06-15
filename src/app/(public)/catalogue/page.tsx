import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogueActiveFilters } from "@/components/catalogue/catalogue-active-filters";
import { CatalogueEmptyState } from "@/components/catalogue/catalogue-empty-state";
import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { CatalogueFiltersMobile } from "@/components/catalogue/catalogue-filters-mobile";
import { CataloguePagination } from "@/components/catalogue/catalogue-pagination";
import { CatalogueToolbar } from "@/components/catalogue/catalogue-toolbar";
import { RecentlyViewedSection } from "@/components/recently-viewed/recently-viewed-section";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  CATALOGUE_URL_FILTER_KEYS,
  hasCatalogueFiltersInQuery,
} from "@/lib/catalog/catalogue-search-params";
import { formatCategoryCountLabel } from "@/lib/catalog/catalogue-labels";
import { parseCatalogueQuery } from "@/lib/catalog/parse-catalogue-query";
import { buildItemListJsonLd } from "@/lib/seo/json-ld";
import { CATALOGUE_SEO_DESCRIPTION } from "@/lib/seo/copy";
import {
  absoluteUrl,
  buildCanonicalFromSearchParams,
  buildPageMetadata,
} from "@/lib/seo/metadata";
import { getCategories } from "@/lib/supabase/queries/categories";
import { getActiveProductsPaginated } from "@/lib/supabase/queries/products";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import type { PaginatedCatalogueResult } from "@/types/catalog";

export const revalidate = 300;

const CATALOGUE_CANONICAL_KEYS = [...CATALOGUE_URL_FILTER_KEYS, "page"];

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

  const query = parseCatalogueQuery(resolved);
  const hasActiveFilters = hasCatalogueFiltersInQuery(query) || (query.page ?? 1) > 1;

  return buildPageMetadata({
    title: "Catalogue vêtements enfants",
    description: CATALOGUE_SEO_DESCRIPTION.replace("Tilouki", name),
    path: canonicalPath,
    noIndex: hasActiveFilters,
  });
}

function CatalogueResults({
  categories,
  result,
  searchParams,
}: {
  categories: Awaited<ReturnType<typeof getCategories>>;
  result: PaginatedCatalogueResult;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = parseCatalogueQuery(searchParams);
  const flatParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : value,
    ]),
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

  const hasFilters = hasCatalogueFiltersInQuery(query);

  return (
    <>
      {itemListJsonLd ? <JsonLdScript data={itemListJsonLd} /> : null}
      <CatalogueToolbar
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
      />
      <CatalogueActiveFilters categories={categories} />
      {result.items.length > 0 ? (
        <CatalogueProductList products={result.items} className="pb-2 md:pb-0" />
      ) : (
        <CatalogueEmptyState hasActiveFilters={hasFilters} />
      )}
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
  const query = parseCatalogueQuery(resolvedParams);
  const [categories, result, settings] = await Promise.all([
    getCategories(),
    getActiveProductsPaginated(query),
    getShopSettings(),
  ]);

  const activeCategoryCount = Object.values(
    settings.navigation.categoryProductCounts,
  ).filter((count) => count > 0).length;

  return (
    <div className="container-tilouki section-tilouki pb-6 md:pb-0">
      <header className="mb-5 space-y-2 sm:mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Catalogue vêtements enfants
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm">
            {formatCategoryCountLabel(activeCategoryCount)} — prix, tailles et stock sur
            chaque article.
          </p>
        </div>
      </header>

      <div className="mb-4 lg:hidden">
        <CatalogueFiltersMobile
          categories={categories}
          facets={result.facets}
          total={result.total}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
          aria-label="Filtres du catalogue"
        >
          <CatalogueFilters categories={categories} facets={result.facets} />
        </aside>

        <div>
          <RecentlyViewedSection
            className="mb-8"
            description="Reprenez vos dernières consultations sur cet appareil."
          />
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <CatalogueResults
              categories={categories}
              result={result}
              searchParams={resolvedParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
