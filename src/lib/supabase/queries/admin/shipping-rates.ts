import "server-only";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import type { CarrierName } from "@/lib/shipping/types";

export interface AdminShippingRate {
  id: string;
  provider: string;
  shippingMethod: string;
  label: string;
  minWeightGrams: number;
  maxWeightGrams: number;
  priceCents: number;
  sortOrder: number;
  isActive: boolean;
}

/** Toutes les tranches (actives et inactives), triées par provider puis ordre. */
export async function listAdminShippingRates(): Promise<AdminShippingRate[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("shipping_rates")
    .select("*")
    .order("provider", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("min_weight_grams", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    provider: row.provider,
    shippingMethod: row.shipping_method ?? "relay_point",
    label: row.label,
    minWeightGrams: row.min_weight_grams,
    maxWeightGrams: row.max_weight_grams,
    priceCents: row.price_cents,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

/** Tranches d'un provider (pour la validation côté server action). */
export async function listAdminShippingRatesForProvider(
  provider: CarrierName,
): Promise<AdminShippingRate[]> {
  const rates = await listAdminShippingRates();
  return rates.filter((rate) => rate.provider === provider);
}
