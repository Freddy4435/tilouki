import "server-only";

import { unstable_cache } from "next/cache";

import { buildStorefrontNavigation } from "@/lib/navigation/build-storefront-nav";
import { CACHE_TAGS, REVALIDATE } from "@/lib/supabase/cache";
import { SHOP_SETTINGS_SINGLETON_ID } from "@/lib/supabase/env";
import { assertNoError } from "@/lib/supabase/errors";
import { getMinShippingPriceCents } from "@/lib/shipping/min-price";
import { mapShopCategory, mapShopSettings } from "@/lib/supabase/mappers/shop";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { ShopSettings } from "@/lib/shop/types";
import { defaultShopSettings } from "@/lib/shop/defaults";
import { fetchCategoriesUncached } from "@/lib/supabase/queries/categories";
import { getActiveProducts } from "@/lib/supabase/queries/products";

async function fetchShopSettings(): Promise<ShopSettings> {
  const [categories, minShippingCents, products] = await Promise.all([
    fetchCategoriesUncached().then((rows) => rows.map(mapShopCategory)),
    getMinShippingPriceCents(),
    getActiveProducts(),
  ]);

  const resolvedCategories =
    categories.length > 0 ? categories : defaultShopSettings.categories;
  const navigation = buildStorefrontNavigation(resolvedCategories, products);

  if (!isSupabaseConfigured()) {
    return mapShopSettings(null, resolvedCategories, minShippingCents, navigation);
  }

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("shop_settings_public")
    .select("*")
    .eq("id", SHOP_SETTINGS_SINGLETON_ID)
    .maybeSingle();

  if (error) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("shop_settings_public")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    assertNoError(fallbackError, "getShopSettings");
    return mapShopSettings(fallback, resolvedCategories, minShippingCents, navigation);
  }

  return mapShopSettings(data, resolvedCategories, minShippingCents, navigation);
}

export async function getShopSettings(): Promise<ShopSettings> {
  return unstable_cache(fetchShopSettings, ["shop-settings"], {
    tags: [CACHE_TAGS.shopSettings],
    revalidate: REVALIDATE.shopSettings,
  })();
}
