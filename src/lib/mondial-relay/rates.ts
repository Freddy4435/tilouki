import type { CartLineItem } from "@/lib/cart/types";

import type { ShippingRate, ShippingRateResult } from "./types";

/** Poids par défaut si non renseigné sur la variante (vêtement enfant). */
export const DEFAULT_ITEM_WEIGHT_GRAMS = 120;

/** Barème par défaut — synchronisé avec la migration shipping_rates. */
export const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  { label: "0 – 250 g", minWeightGrams: 0, maxWeightGrams: 250, priceCents: 390, sortOrder: 1 },
  { label: "251 – 500 g", minWeightGrams: 251, maxWeightGrams: 500, priceCents: 490, sortOrder: 2 },
  { label: "501 g – 1 kg", minWeightGrams: 501, maxWeightGrams: 1000, priceCents: 590, sortOrder: 3 },
  { label: "1 – 2 kg", minWeightGrams: 1001, maxWeightGrams: 2000, priceCents: 690, sortOrder: 4 },
  { label: "2 – 3 kg", minWeightGrams: 2001, maxWeightGrams: 3000, priceCents: 890, sortOrder: 5 },
];

export function computeCartWeightGrams(
  items: Pick<CartLineItem, "weightGrams" | "quantity">[],
): number {
  return items.reduce(
    (sum, item) => sum + (item.weightGrams ?? DEFAULT_ITEM_WEIGHT_GRAMS) * item.quantity,
    0,
  );
}

function sortRates(rates: ShippingRate[]): ShippingRate[] {
  return [...rates].sort(
    (a, b) => (a.sortOrder ?? a.minWeightGrams) - (b.sortOrder ?? b.minWeightGrams),
  );
}

/**
 * Calcule les frais de livraison selon le poids total et le barème actif.
 */
export function calculateShippingRate(
  totalWeightGrams: number,
  rates: ShippingRate[] = DEFAULT_SHIPPING_RATES,
): ShippingRateResult {
  const sorted = sortRates(rates);

  if (totalWeightGrams <= 0) {
    const first = sorted[0] ?? DEFAULT_SHIPPING_RATES[0]!;
    return { rate: first, priceCents: 0, totalWeightGrams: 0 };
  }

  const match =
    sorted.find(
      (rate) =>
        totalWeightGrams >= rate.minWeightGrams && totalWeightGrams <= rate.maxWeightGrams,
    ) ?? sorted[sorted.length - 1];

  if (!match) {
    throw new Error("Aucune tranche tarifaire disponible pour ce poids.");
  }

  return {
    rate: match,
    priceCents: match.priceCents,
    totalWeightGrams,
  };
}

export function calculateRelayShippingCents(
  totalWeightGrams: number,
  rates: ShippingRate[] = DEFAULT_SHIPPING_RATES,
): number {
  return calculateShippingRate(totalWeightGrams, rates).priceCents;
}

export function computeShippingCents(
  items: Pick<CartLineItem, "weightGrams" | "quantity">[],
  rates: ShippingRate[] = DEFAULT_SHIPPING_RATES,
): number {
  if (items.length === 0) return 0;
  return calculateRelayShippingCents(computeCartWeightGrams(items), rates);
}
