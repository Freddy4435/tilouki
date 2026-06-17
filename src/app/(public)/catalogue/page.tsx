import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogueCapsulesView } from "@/components/catalogue/catalogue-capsules-view";
import {
  CatalogueRayonBanner,
  CatalogueRayonTools,
} from "@/components/catalogue/catalogue-rayon-header";
import { CatalogueActiveFilters } from "@/components/catalogue/catalogue-active-filters";
import { CatalogueEmptyState } from "@/components/catalogue/catalogue-empty-state";
import { CatalogueLaunchState } from "@/components/catalogue/catalogue-launch-state";
import { CatalogueMobileFilterBar } from "@/components/catalogue/catalogue-mobile-filter-bar";
import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { CataloguePagination } from "@/components/catalogue/catalogue-pagination";
import { CatalogueRayonsView } from "@/components/catalogue/catalogue-rayons-view";
import { CatalogueToolbar } from "@/components/catalogue/catalogue-toolbar";
import { CatalogueViewSwitch } from "@/components/catalogue/catalogue-view-switch";
import { RecentlyViewedSection } from "@/components/recently-viewed/recently-viewed-section";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  CATALOGUE_URL_FILTER_KEYS,
  hasCatalogueFiltersInQuery,
} from "@/lib/catalog/catalogue-search-params";
import { formatCategoryCountLabel } from "@/lib/catalog/catalogue-labels";
import { parseCatalogueView } from "@/lib/catalog/catalogue-view";
import { parseCatalogueQuery } from "@/lib/catalog/parse-catalogue-query";
import { buildItemListJsonLd } from "@/lib/seo/json-ld";
import { CATALOGUE_SEO_DESCRIPTION } from "@/lib/seo/copy";
import { getTiloukiImage } from "@/lib/tilouki-images";
import {
  absoluteUrl,
  buildCanonicalFromSearchParams,
  buildPageMetadata,
} from "@/lib/seo/metadata";
import { getCategories } from "@/lib/supabase/queries/categories";
import {
  getActiveProductsPaginated,
  getFilteredCatalogueProducts,
  hasActiveCatalogueProducts,
} from "@/lib/supabase/queries/products";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import type { PaginatedCatalogueResult } from "@/types/catalog";

export const revalidate = 300;

const CATALOGUE_CANONICAL_KEYS = [...CATALOGUE_URL_FILTER_KEYS, "page", "vue"];

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
  const catalogueHasProducts = await hasActiveCatalogueProducts();

  return buildPageMetadata({
    title: catalogueHasProducts
      ? "Catalogue vêtements enfants"
      : "Le catalogue Tilouki arrive bientôt",
    description: catalogueHasProducts
      ? CATALOGUE_SEO_DESCRIPTION.replace("Tilouki", name)
      : `Catalogue ${name} — premières pièces en ligne bientôt. Arrivage du mercredi et capsules shopping.`,
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
      <CatalogueMobileFilterBar
        categories={categories}
        facets={result.facets}
        total={result.total}
      />
      <CatalogueToolbar
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        showSort={result.total > 0}
      />
      <CatalogueActiveFilters categories={categories} className="hidden lg:flex" />
      {result.items.length > 0 ? (
        <CatalogueProductList products={result.items} className="pb-2 md:pb-0" />
      ) : (
        <CatalogueEmptyState hasActiveFilters={hasFilters} categories={categories} />
      )}
      <CataloguePagination
        page={result.page}
        totalPages={result.totalPages}
        searchParams={flatParams}
        className="mt-6"
      />
    </>
  );
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const resolvedParams = await searchParams;
  const query = parseCatalogueQuery(resolvedParams);
  const view = parseCatalogueView(resolvedParams);

  const [categories, settings, catalogueHasProducts] = await Promise.all([
    getCategories(),
    getShopSettings(),
    hasActiveCatalogueProducts(),
  ]);

  const [result, capsuleProducts] = await Promise.all([
    view === "produits" && catalogueHasProducts
      ? getActiveProductsPaginated(query)
      : Promise.resolve(null),
    view === "capsules" ? getFilteredCatalogueProducts(query) : Promise.resolve([]),
  ]);

  const activeCategoryCount = Object.values(
    settings.navigation.categoryProductCounts,
  ).filter((count) => count > 0).length;

  const catalogueBannerImage = getTiloukiImage("categorie-boutique-enfants-mannequins");
  const bannerCount =
    view === "rayons"
      ? activeCategoryCount
      : view === "capsules"
        ? capsuleProducts.length
        : (result?.total ?? 0);

  const bannerEyebrow =
    view === "rayons"
      ? "Tableau des rayons"
      : view === "capsules"
        ? "Tableau des capsules"
        : formatCategoryCountLabel(activeCategoryCount);

  return (
    <div className="container-tilouki section-tilouki overflow-x-hidden pb-6 md:pb-0">
      <header className="mb-4 space-y-3 sm:mb-5">
        <CatalogueRayonBanner
          title="Catalogue"
          productCount={bannerCount}
          eyebrow={bannerEyebrow}
          image={{ src: catalogueBannerImage.src, alt: catalogueBannerImage.alt }}
          cta={{ label: "Guide des tailles", href: "/guide-tailles" }}
        />
        <Suspense
          fallback={
            <div
              className="bg-muted h-11 w-full max-w-md animate-pulse rounded-full"
              aria-hidden
            />
          }
        >
          <CatalogueViewSwitch />
        </Suspense>
        {view === "produits" && catalogueHasProducts ? (
          <Suspense
            fallback={
              <div
                className="bg-muted h-16 animate-pulse rounded-[var(--radius-card)]"
                aria-hidden
              />
            }
          >
            <CatalogueRayonTools
              showSort={(result?.total ?? 0) > 0}
              productCount={result?.total ?? 0}
            />
          </Suspense>
        ) : null}
      </header>

      {view === "produits" ? (
        !catalogueHasProducts ? (
          <CatalogueLaunchState />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[15rem_1fr] lg:gap-6">
            <aside
              className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
              aria-label="Filtres du catalogue"
            >
              <CatalogueFilters categories={categories} facets={result!.facets} />
            </aside>

            <div>
              <Suspense fallback={<ProductGridSkeleton count={8} />}>
                <CatalogueResults
                  categories={categories}
                  result={result!}
                  searchParams={resolvedParams}
                />
              </Suspense>
              <RecentlyViewedSection
                className="mt-10"
                description="Reprenez vos dernières consultations sur cet appareil."
              />
            </div>
          </div>
        )
      ) : null}

      {view === "capsules" ? (
        <CatalogueCapsulesView
          products={capsuleProducts}
          query={query}
          categories={categories}
        />
      ) : null}

      {view === "rayons" ? (
        <CatalogueRayonsView
          categories={categories}
          productCounts={settings.navigation.categoryProductCounts}
        />
      ) : null}
    </div>
  );
}
