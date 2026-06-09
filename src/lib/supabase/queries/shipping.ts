import "server-only";

import { unstable_cache } from "next/cache";

import { DEFAULT_SHIPPING_RATES } from "@/lib/mondial-relay/rates";
import type { ShippingRate } from "@/lib/mondial-relay/types";
import { CACHE_TAGS, REVALIDATE } from "@/lib/supabase/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { assertNoError } from "@/lib/supabase/errors";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database";

type ShippingRateRow = Database["public"]["Tables"]["shipping_rates"]["Row"];

function mapShippingRate(row: ShippingRateRow): ShippingRate {
  return {
    id: row.id,
    provider: row.provider,
    label: row.label,
    minWeightGrams: row.min_weight_grams,
    maxWeightGrams: row.max_weight_grams,
    priceCents: row.price_cents,
    sortOrder: row.sort_order,
  };
}

async function fetchActiveShippingRates(): Promise<ShippingRate[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_SHIPPING_RATES;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  assertNoError(error, "getActiveShippingRates");

  if (!data?.length) {
    return DEFAULT_SHIPPING_RATES;
  }

  return data.map(mapShippingRate);
}

export async function getActiveShippingRates(): Promise<ShippingRate[]> {
  return unstable_cache(fetchActiveShippingRates, ["active-shipping-rates"], {
    tags: [CACHE_TAGS.shippingRates],
    revalidate: REVALIDATE.shopSettings,
  })();
}
