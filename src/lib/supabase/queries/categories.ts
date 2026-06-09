import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS, REVALIDATE } from "@/lib/supabase/cache";
import { assertNoError, SupabaseDataError } from "@/lib/supabase/errors";
import { mapCategory } from "@/lib/supabase/mappers/product";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category } from "@/types/catalog";

export async function fetchCategoriesUncached(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  assertNoError(error, "getCategories");

  return (data ?? []).map(mapCategory);
}

export async function getCategories(): Promise<Category[]> {
  return unstable_cache(fetchCategoriesUncached, ["categories"], {
    tags: [CACHE_TAGS.categories],
    revalidate: REVALIDATE.categories,
  })();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return unstable_cache(
    async () => {
      if (!isSupabaseConfigured()) return null;

      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        throw new SupabaseDataError(`getCategoryBySlug(${slug})`, error);
      }

      return data ? mapCategory(data) : null;
    },
    ["category-by-slug", slug],
    {
      tags: [CACHE_TAGS.categories],
      revalidate: REVALIDATE.categories,
    },
  )();
}
