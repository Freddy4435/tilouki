import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS, REVALIDATE } from "@/lib/supabase/cache";
import { SHOP_SETTINGS_SINGLETON_ID } from "@/lib/supabase/env";
import { assertNoError } from "@/lib/supabase/errors";
import { mapShopCategory, mapShopSettings } from "@/lib/supabase/mappers/shop";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { ShopSettings } from "@/lib/shop/types";
import { fetchCategoriesUncached } from "@/lib/supabase/queries/categories";

async function fetchShopSettings(): Promise<ShopSettings> {
  const categories = (await fetchCategoriesUncached()).map(mapShopCategory);

  if (!isSupabaseConfigured()) {
    return mapShopSettings(null, categories);
  }

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .eq("id", SHOP_SETTINGS_SINGLETON_ID)
    .maybeSingle();

  if (error) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("shop_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    assertNoError(fallbackError, "getShopSettings");
    return mapShopSettings(fallback, categories);
  }

  return mapShopSettings(data, categories);
}

export async function getShopSettings(): Promise<ShopSettings> {
  return unstable_cache(fetchShopSettings, ["shop-settings"], {
    tags: [CACHE_TAGS.shopSettings],
    revalidate: REVALIDATE.shopSettings,
  })();
}
