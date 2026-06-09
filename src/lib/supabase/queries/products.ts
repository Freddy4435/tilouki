import "server-only";

import { unstable_cache } from "next/cache";

import { CATALOGUE_PAGE_SIZE } from "@/lib/catalog/constants";
import { filterLowPriceProducts, sortProducts } from "@/lib/catalog/sort-products";
import { CACHE_TAGS, REVALIDATE, productTag } from "@/lib/supabase/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { assertNoError, isNotFoundError, SupabaseDataError } from "@/lib/supabase/errors";
import {
  mapProductDetail,
  mapProductListItem,
  type ProductWithRelations,
} from "@/lib/supabase/mappers/product";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  CatalogueQuery,
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
  const sorted = sortProducts(items, query.sort ?? "newest");
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

async function fetchAllActiveProducts(
  filters?: Pick<ProductFilters, "gender" | "season" | "query">,
): Promise<ProductListItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  let dbQuery = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

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

  return ((data ?? []) as ProductWithRelations[]).map(mapProductListItem);
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
): Promise<PaginatedProducts> {
  const cacheKey = JSON.stringify(query);

  return unstable_cache(
    async () => {
      const items = await fetchAllActiveProducts({
        gender: query.gender,
        season: query.season,
        query: query.query,
      });
      const filtered = applyCatalogueFilters(items, query);
      return paginateProducts(filtered, query);
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

  return mapProductDetail(data as ProductWithRelations);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return unstable_cache(() => fetchProductBySlug(slug), ["product-by-slug", slug], {
    tags: [CACHE_TAGS.products, productTag(slug)],
    revalidate: REVALIDATE.product,
  })();
}

async function fetchRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductListItem[]> {
  if (!isSupabaseConfigured() || !categoryId) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  assertNoError(error, "getRelatedProducts");

  return ((data ?? []) as ProductWithRelations[]).map(mapProductListItem);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductListItem[]> {
  return unstable_cache(
    () => fetchRelatedProducts(productId, categoryId, limit),
    ["related-products", productId, categoryId ?? "none", String(limit)],
    {
      tags: [CACHE_TAGS.products, productTag(productId)],
      revalidate: REVALIDATE.product,
    },
  )();
}
