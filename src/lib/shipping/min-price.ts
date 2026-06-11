import "server-only";

import { getAvailableCarriers } from "@/lib/shipping/carriers";
import { getDefaultRatesForCarrier } from "@/lib/shipping/rates";
import { getActiveShippingRatesByCarrier } from "@/lib/supabase/queries/shipping";

/** Prix minimum des frais de port actifs (tous transporteurs configurés). */
export async function getMinShippingPriceCents(): Promise<number> {
  const carriers = getAvailableCarriers();
  const fallback = getDefaultRatesForCarrier("mondial_relay")[0]?.priceCents ?? 390;

  if (carriers.length === 0) return fallback;

  const ratesByCarrier = await getActiveShippingRatesByCarrier(
    carriers.map((carrier) => carrier.id),
  );

  const prices = Object.values(ratesByCarrier)
    .flat()
    .map((rate) => rate.priceCents);

  return prices.length > 0 ? Math.min(...prices) : fallback;
}
