import { unstable_cache } from "next/cache";

import { CACHE_TAGS, REVALIDATE } from "@/lib/supabase/cache";
import { getActiveProducts } from "@/lib/supabase/queries/products";
import type { ProductListItem } from "@/types/catalog";

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 8;

export interface SearchSuggestion {
  slug: string;
  name: string;
  categoryName: string | null;
  minPriceCents: number;
  primaryImageUrl: string | null;
  sizes: string[];
}

function toSuggestion(product: ProductListItem): SearchSuggestion {
  return {
    slug: product.slug,
    name: product.name,
    categoryName: product.categoryName,
    minPriceCents: product.minPriceCents,
    primaryImageUrl: product.primaryImageUrl,
    sizes: product.sizes.slice(0, 4),
  };
}

export async function getSearchSuggestions(
  query: string,
  limit = DEFAULT_LIMIT,
): Promise<SearchSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const cacheKey = `${trimmed.toLowerCase()}:${limit}`;

  return unstable_cache(
    async () => {
      const products = await getActiveProducts({ query: trimmed, limit: 24 });
      return products.slice(0, limit).map(toSuggestion);
    },
    ["search-suggestions", cacheKey],
    {
      tags: [CACHE_TAGS.products],
      revalidate: REVALIDATE.catalog,
    },
  )();
}
