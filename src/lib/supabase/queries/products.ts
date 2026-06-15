import "server-only";

import { unstable_cache } from "next/cache";

import { CATALOGUE_PAGE_SIZE } from "@/lib/catalog/constants";
import {
  buildCataloguePreparedRows,
  computeCatalogueFacets,
  filterCataloguePreparedRows,
} from "@/lib/catalog/catalogue-facets";
import { sortStorefrontListedFirst } from "@/lib/catalog/product-card-data";
import {
  filterStorefrontListedProducts,
  hasCommercialStorefrontImages,
  isStorefrontBlockedSlug,
} from "@/lib/catalog/product-sellability";
import { filterLowPriceProducts, sortProducts } from "@/lib/catalog/sort-products";
import {
  attachRatingSummariesToProducts,
  getProductRatingSummaries,
} from "@/lib/supabase/queries/reviews";
import { CACHE_TAGS, REVALIDATE, productTag } from "@/lib/supabase/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  assertNoError,
  isNotFoundError,
  SupabaseDataError,
} from "@/lib/supabase/errors";
import {
  mapProductDetail,
  mapProductListItem,
  type ProductWithRelations,
} from "@/lib/supabase/mappers/product";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  CatalogueQuery,
  PaginatedCatalogueResult,
  PaginatedProducts,
  ProductDetail,
  ProductFilters,
  ProductListItem,
} from "@/types/catalog";

const PRODUCT_SELECT = `
  *,
  category:categories(id, name, slug),
  images:product_images(id, product_id, url, alt, sort_order, created_at),
  variants:catalog_variants(*)
`;

function isProductRowVisibleOnStorefront(row: ProductWithRelations): boolean {
  if (isStorefrontBlockedSlug(row.slug)) return false;
  return hasCommercialStorefrontImages(
    row.images.map((image) => ({ url: image.url, alt: image.alt })),
  );
}

function filterStorefrontProductRows(
  rows: ProductWithRelations[],
): ProductWithRelations[] {
  return rows.filter(isProductRowVisibleOnStorefront);
}

function applyCatalogueFilters(
  items: ProductListItem[],
  query: CatalogueQuery,
): ProductListItem[] {
  let result = items;

  if (query.categorySlug) {
    result = result.filter((p) => p.categorySlug === query.categorySlug);
  }

  if (query.minPriceCents != null) {
    result = result.filter((p) => p.minPriceCents >= query.minPriceCents!);
  }

  if (query.maxPriceCents != null) {
    result = result.filter((p) => p.minPriceCents <= query.maxPriceCents!);
  }

  if (query.promo === "petit-prix") {
    result = filterLowPriceProducts(result);
  }

  return result;
}

function paginateProducts(
  items: ProductListItem[],
  query: CatalogueQuery,
): PaginatedProducts {
  const pageSize = query.pageSize ?? CATALOGUE_PAGE_SIZE;
  const page = Math.max(1, query.page ?? 1);
  const sorted = sortProducts(sortStorefrontListedFirst(items), query.sort ?? "newest");
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  return {
    items: sorted.slice(offset, offset + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

async function fetchAllActiveProductRows(
  filters?: Pick<ProductFilters, "gender" | "season" | "query">,
  options?: { dbLimit?: number },
): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  let dbQuery = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (options?.dbLimit && options.dbLimit > 0) {
    dbQuery = dbQuery.limit(options.dbLimit);
  }

  if (filters?.gender) {
    dbQuery = dbQuery.eq("gender", filters.gender);
  }

  if (filters?.season) {
    dbQuery = dbQuery.ilike("season", `%${filters.season}%`);
  }

  if (filters?.query?.trim()) {
    const term = filters.query.trim();
    dbQuery = dbQuery.or(`name.ilike.%${term}%,short_description.ilike.%${term}%`);
  }

  const { data, error } = await dbQuery;
  assertNoError(error, "getActiveProducts");

  return (data ?? []) as ProductWithRelations[];
}

/** Plafond DB pour l'accueil — sections home n'utilisent qu'un sous-ensemble récent. */
export const HOME_PRODUCT_POOL_DB_LIMIT = 96;

async function fetchAllActiveProducts(
  filters?: Pick<ProductFilters, "gender" | "season" | "query">,
  options?: { dbLimit?: number },
): Promise<ProductListItem[]> {
  const rows = filterStorefrontProductRows(
    await fetchAllActiveProductRows(filters, options),
  );
  return rows.map(mapProductListItem);
}

export async function getActiveProductsForHome(): Promise<ProductListItem[]> {
  return unstable_cache(
    async () =>
      fetchAllActiveProducts(undefined, { dbLimit: HOME_PRODUCT_POOL_DB_LIMIT }),
    ["active-products-home-pool"],
    {
      tags: [CACHE_TAGS.products],
      revalidate: REVALIDATE.catalog,
    },
  )();
}

export async function getActiveProducts(
  filters?: ProductFilters,
): Promise<ProductListItem[]> {
  const cacheKey = JSON.stringify(filters ?? {});

  return unstable_cache(
    async () => {
      const items = await fetchAllActiveProducts(filters);
      const filtered = applyCatalogueFilters(items, {
        categorySlug: filters?.categorySlug,
        minPriceCents: filters?.minPriceCents,
        maxPriceCents: filters?.maxPriceCents,
      });
      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? filtered.length;
      return filtered.slice(offset, offset + limit);
    },
    ["active-products", cacheKey],
    {
      tags: [CACHE_TAGS.products],
      revalidate: REVALIDATE.catalog,
    },
  )();
}

export async function getActiveProductsPaginated(
  query: CatalogueQuery = {},
): Promise<PaginatedCatalogueResult> {
  const cacheKey = JSON.stringify(query);

  return unstable_cache(
    async () => {
      const rows = filterStorefrontProductRows(
        await fetchAllActiveProductRows({
          gender: query.gender,
          season: query.season,
          query: query.query,
        }),
      );
      const prepared = buildCataloguePreparedRows(rows, mapProductListItem);
      const facets = computeCatalogueFacets(prepared, query);
      const filtered = filterCataloguePreparedRows(prepared, query).map(
        (entry) => entry.item,
      );
      const paginated = paginateProducts(filtered, query);
      const summaries = await getProductRatingSummaries(
        paginated.items.map((item) => item.id),
      );

      return {
        ...paginated,
        items: attachRatingSummariesToProducts(paginated.items, summaries),
        facets,
      };
    },
    ["active-products-paginated", cacheKey],
    {
      tags: [CACHE_TAGS.products],
      revalidate: REVALIDATE.catalog,
    },
  )();
}

async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (isNotFoundError(error)) return null;
    throw new SupabaseDataError(`getProductBySlug(${slug})`, error);
  }

  if (!data) return null;

  if (!isProductRowVisibleOnStorefront(data as ProductWithRelations)) {
    return null;
  }

  return mapProductDetail(data as ProductWithRelations);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return unstable_cache(
    async () => {
      const detail = await fetchProductBySlug(slug);
      if (!detail) return null;
      const summaries = await getProductRatingSummaries([detail.id]);
      const [withRating] = attachRatingSummariesToProducts([detail], summaries);
      return withRating ?? detail;
    },
    ["product-by-slug", slug],
    {
      tags: [CACHE_TAGS.products, productTag(slug)],
      revalidate: REVALIDATE.product,
    },
  )();
}

async function fetchRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductListItem[]> {
  if (!isSupabaseConfigured() || !categoryId) return [];

  const supabase = createPublicClient();
  const fetchLimit = Math.max(limit * 6, 24);
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  assertNoError(error, "getRelatedProducts");

  return filterStorefrontProductRows((data ?? []) as ProductWithRelations[])
    .map(mapProductListItem)
    .slice(0, limit);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductListItem[]> {
  return unstable_cache(
    async () => {
      const mapped = await fetchRelatedProducts(productId, categoryId, limit);
      const summaries = await getProductRatingSummaries(mapped.map((item) => item.id));
      return attachRatingSummariesToProducts(mapped, summaries);
    },
    ["related-products", productId, categoryId ?? "none", String(limit)],
    {
      tags: [CACHE_TAGS.products, productTag(productId)],
      revalidate: REVALIDATE.product,
    },
  )();
}

async function fetchProductsBySlugs(slugs: string[]): Promise<ProductListItem[]> {
  const normalized = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (normalized.length === 0 || !isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .in("slug", normalized);

  assertNoError(error, "getProductsBySlugs");

  return filterStorefrontProductRows((data ?? []) as ProductWithRelations[]).map(
    mapProductListItem,
  );
}

export async function getProductsBySlugs(slugs: string[]): Promise<ProductListItem[]> {
  const normalized = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (normalized.length === 0) return [];

  const cacheKey = normalized.slice().sort().join(",");

  return unstable_cache(
    () => fetchProductsBySlugs(normalized),
    ["products-by-slugs", cacheKey],
    {
      tags: [CACHE_TAGS.products],
      revalidate: REVALIDATE.catalog,
    },
  )();
}
