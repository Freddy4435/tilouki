import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogueCapsulesView } from "@/components/catalogue/catalogue-capsules-view";
import {
  CatalogueRayonBanner,
  CatalogueRayonTools,
} from "@/components/catalogue/catalogue-rayon-header";
import { CatalogueActiveFilters } from "@/components/catalogue/catalogue-active-filters";
import { CatalogueEmptyState } from "@/components/catalogue/catalogue-empty-state";
import { CatalogueMobileFilterBar } from "@/components/catalogue/catalogue-mobile-filter-bar";
import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { CataloguePagination } from "@/components/catalogue/catalogue-pagination";
import { CatalogueRayonsView } from "@/components/catalogue/catalogue-rayons-view";
import { CatalogueToolbar } from "@/components/catalogue/catalogue-toolbar";
import { CatalogueViewSwitch } from "@/components/catalogue/catalogue-view-switch";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  CATALOGUE_URL_FILTER_KEYS,
  hasCatalogueFiltersInQuery,
} from "@/lib/catalog/catalogue-search-params";
import { parseCatalogueView } from "@/lib/catalog/catalogue-view";
import { parseCatalogueQuery } from "@/lib/catalog/parse-catalogue-query";
import { getCategorySeoDescription } from "@/lib/seo/copy";
import { resolveCategoryTiloukiImage } from "@/lib/tilouki-images";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo/json-ld";
import {
  absoluteUrl,
  buildCanonicalFromSearchParams,
  buildPageMetadata,
} from "@/lib/seo/metadata";
import { getCategories, getCategoryBySlug } from "@/lib/supabase/queries/categories";
import {
  getActiveProductsPaginated,
  getFilteredCatalogueProducts,
} from "@/lib/supabase/queries/products";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import type { PaginatedCatalogueResult } from "@/types/catalog";

export const revalidate = 300;

const CATEGORY_CANONICAL_KEYS = [
  ...CATALOGUE_URL_FILTER_KEYS.filter((key) => key !== "categorie"),
  "page",
  "vue",
];

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

function CategoryResults({
  slug,
  categories,
  result,
  searchParams,
}: {
  slug: string;
  categories: Awaited<ReturnType<typeof getCategories>>;
  result: PaginatedCatalogueResult;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = { ...parseCatalogueQuery(searchParams), categorySlug: slug };
  const basePath = `/categorie/${slug}`;
  const flatParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : value,
    ]),
  );

  const hasFilters = hasCatalogueFiltersInQuery(query);

  return (
    <>
      <CatalogueMobileFilterBar
        categories={categories}
        facets={result.facets}
        total={result.total}
        lockedCategorySlug={slug}
        basePath={basePath}
      />
      <CatalogueToolbar
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        showSort={result.total > 0}
      />
      <CatalogueActiveFilters
        categories={categories}
        basePath={basePath}
        lockedCategorySlug={slug}
        className="hidden lg:flex"
      />
      {result.items.length > 0 ? (
        <CatalogueProductList products={result.items} className="pb-2 md:pb-0" />
      ) : (
        <CatalogueEmptyState
          hasActiveFilters={hasFilters}
          resetHref={basePath}
          categorySlug={slug}
          categoryName={categories.find((item) => item.slug === slug)?.name}
          categories={categories}
        />
      )}
      <CataloguePagination
        page={result.page}
        totalPages={result.totalPages}
        searchParams={flatParams}
        basePath={basePath}
        className="mt-6"
      />
    </>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const view = parseCatalogueView(resolvedSearch);
  const query = { ...parseCatalogueQuery(resolvedSearch), categorySlug: slug };

  const [category, categories, settings] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getShopSettings(),
  ]);

  if (!category) notFound();

  const basePath = `/categorie/${slug}`;

  const [result, capsuleProducts] = await Promise.all([
    view === "produits" ? getActiveProductsPaginated(query) : Promise.resolve(null),
    view === "capsules" ? getFilteredCatalogueProducts(query) : Promise.resolve([]),
  ]);

  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Catalogue", path: "/catalogue" },
    { name: category.name, path: basePath },
  ];

  const itemListJsonLd =
    result && result.items.length > 0
      ? buildItemListJsonLd(
          result.items.map((product) => ({
            name: product.name,
            url: absoluteUrl(`/produit/${product.slug}`),
          })),
        )
      : null;

  const categoryImage = resolveCategoryTiloukiImage(category.slug);
  const bannerCount =
    view === "rayons"
      ? categories.length
      : view === "capsules"
        ? capsuleProducts.length
        : (result?.total ?? 0);

  return (
    <div className="container-tilouki section-tilouki overflow-x-hidden pb-6 md:pb-10">
      <JsonLdScript
        data={[
          buildBreadcrumbJsonLd(breadcrumbs),
          ...(itemListJsonLd ? [itemListJsonLd] : []),
        ]}
      />

      <Breadcrumbs items={breadcrumbs} className="mb-3" />

      <header className="mb-4 space-y-3 sm:mb-5">
        <CatalogueRayonBanner
          title={category.name}
          productCount={bannerCount}
          eyebrow={
            view === "capsules"
              ? "Capsules du rayon"
              : view === "rayons"
                ? "Tous les rayons"
                : "Rayon"
          }
          image={{ src: categoryImage.src, alt: categoryImage.alt }}
          cta={{ label: "Tout le catalogue", href: "/catalogue" }}
        />
        <Suspense
          fallback={
            <div
              className="bg-muted h-11 w-full max-w-md animate-pulse rounded-full"
              aria-hidden
            />
          }
        >
          <CatalogueViewSwitch basePath={basePath} />
        </Suspense>
        {view === "produits" ? (
          <Suspense
            fallback={
              <div
                className="bg-muted h-16 animate-pulse rounded-[var(--radius-card)]"
                aria-hidden
              />
            }
          >
            <CatalogueRayonTools
              categorySlug={slug}
              showSort={(result?.total ?? 0) > 0}
              productCount={result?.total ?? 0}
            />
          </Suspense>
        ) : null}
      </header>

      {view === "produits" ? (
        <div className="grid gap-5 lg:grid-cols-[15rem_1fr] lg:gap-6">
          <aside
            className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
            aria-label="Filtres de la catégorie"
          >
            <CatalogueFilters
              categories={categories}
              facets={result?.facets ?? { sizes: [], colors: [], ages: [] }}
              lockedCategorySlug={slug}
              basePath={basePath}
            />
          </aside>

          <div>
            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              {result ? (
                <CategoryResults
                  slug={slug}
                  categories={categories}
                  result={result}
                  searchParams={resolvedSearch}
                />
              ) : (
                <ProductGridSkeleton count={8} />
              )}
            </Suspense>
          </div>
        </div>
      ) : null}

      {view === "capsules" ? (
        <CatalogueCapsulesView
          products={capsuleProducts}
          query={query}
          categories={categories}
          categorySlug={slug}
        />
      ) : null}

      {view === "rayons" ? (
        <CatalogueRayonsView
          categories={categories}
          productCounts={settings.navigation.categoryProductCounts}
          highlightSlug={slug}
        />
      ) : null}
    </div>
  );
}
