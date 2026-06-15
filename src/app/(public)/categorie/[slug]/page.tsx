import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogueActiveFilters } from "@/components/catalogue/catalogue-active-filters";
import { CatalogueEmptyState } from "@/components/catalogue/catalogue-empty-state";
import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { CatalogueFiltersMobile } from "@/components/catalogue/catalogue-filters-mobile";
import { CataloguePagination } from "@/components/catalogue/catalogue-pagination";
import { CatalogueToolbar } from "@/components/catalogue/catalogue-toolbar";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  CATALOGUE_URL_FILTER_KEYS,
  hasCatalogueFiltersInQuery,
} from "@/lib/catalog/catalogue-search-params";
import { parseCatalogueQuery } from "@/lib/catalog/parse-catalogue-query";
import { getCategorySeoDescription } from "@/lib/seo/copy";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo/json-ld";
import {
  absoluteUrl,
  buildCanonicalFromSearchParams,
  buildPageMetadata,
} from "@/lib/seo/metadata";
import { getCategories, getCategoryBySlug } from "@/lib/supabase/queries/categories";
import { getActiveProductsPaginated } from "@/lib/supabase/queries/products";
import type { PaginatedCatalogueResult } from "@/types/catalog";

export const revalidate = 300;

const CATEGORY_CANONICAL_KEYS = [
  ...CATALOGUE_URL_FILTER_KEYS.filter((key) => key !== "categorie"),
  "page",
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
      <CatalogueToolbar
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
      />
      <CatalogueActiveFilters
        categories={categories}
        basePath={basePath}
        lockedCategorySlug={slug}
      />
      {result.items.length > 0 ? (
        <CatalogueProductList products={result.items} className="pb-2 md:pb-0" />
      ) : (
        <CatalogueEmptyState hasActiveFilters={hasFilters} resetHref={basePath} />
      )}
      <CataloguePagination
        page={result.page}
        totalPages={result.totalPages}
        searchParams={flatParams}
        basePath={basePath}
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
  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (!category) notFound();

  const query = { ...parseCatalogueQuery(resolvedSearch), categorySlug: slug };
  const result = await getActiveProductsPaginated(query);
  const basePath = `/categorie/${slug}`;

  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Catalogue", path: "/catalogue" },
    { name: category.name, path: basePath },
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

      <header className="mb-5 space-y-2 sm:mb-6">
        <p className="text-retail-label text-muted-foreground">Catégorie</p>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {category.name}
        </h1>
        <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
          {getCategorySeoDescription(category)}
        </p>
      </header>

      <div className="mb-4 lg:hidden">
        <CatalogueFiltersMobile
          categories={categories}
          facets={result.facets}
          total={result.total}
          lockedCategorySlug={slug}
          basePath={basePath}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
          aria-label="Filtres de la catégorie"
        >
          <CatalogueFilters
            categories={categories}
            facets={result.facets}
            lockedCategorySlug={slug}
            basePath={basePath}
          />
        </aside>

        <div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <CategoryResults
              slug={slug}
              categories={categories}
              result={result}
              searchParams={resolvedSearch}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
