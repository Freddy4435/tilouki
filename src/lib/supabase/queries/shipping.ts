import "server-only";

import { unstable_cache } from "next/cache";

import { getDefaultRatesForCarrier } from "@/lib/shipping/rates";
import type { CarrierName, ShippingRate } from "@/lib/shipping/types";
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

async function fetchActiveShippingRates(carrier: CarrierName): Promise<ShippingRate[]> {
  if (!isSupabaseConfigured()) {
    return getDefaultRatesForCarrier(carrier);
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("*")
    .eq("is_active", true)
    .eq("provider", carrier)
    .order("sort_order", { ascending: true });

  assertNoError(error, "getActiveShippingRates");

  if (!data?.length) {
    return getDefaultRatesForCarrier(carrier);
  }

  return data.map(mapShippingRate);
}

/** Barème actif du transporteur (défaut : Mondial Relay — compat historique). */
export async function getActiveShippingRates(
  carrier: CarrierName = "mondial_relay",
): Promise<ShippingRate[]> {
  return unstable_cache(
    () => fetchActiveShippingRates(carrier),
    ["active-shipping-rates", carrier],
    {
      tags: [CACHE_TAGS.shippingRates],
      revalidate: REVALIDATE.shopSettings,
    },
  )();
}

/** Barèmes actifs groupés par transporteur (sélecteur checkout / API rates). */
export async function getActiveShippingRatesByCarrier(
  carriers: CarrierName[],
): Promise<Partial<Record<CarrierName, ShippingRate[]>>> {
  const entries = await Promise.all(
    carriers.map(async (carrier) => [carrier, await getActiveShippingRates(carrier)] as const),
  );

  return Object.fromEntries(entries);
}
