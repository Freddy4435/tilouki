"use client";

import { useEffect, useMemo, useState } from "react";

import { useCartStore } from "@/lib/cart/store";
import {
  calculateShippingRate,
  computeCartWeightGrams,
  computeShippingCents,
  DEFAULT_SHIPPING_RATES,
} from "@/lib/mondial-relay/rates";
import type { ShippingRate } from "@/lib/mondial-relay/types";

export function useCartShipping() {
  const items = useCartStore((s) => s.items);
  const [rates, setRates] = useState<ShippingRate[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      try {
        const response = await fetch("/api/shipping/rates");
        if (!response.ok) return;
        const data = (await response.json()) as { rates: ShippingRate[] };
        if (!cancelled) setRates(data.rates?.length ? data.rates : DEFAULT_SHIPPING_RATES);
      } catch {
        if (!cancelled) setRates(DEFAULT_SHIPPING_RATES);
      }
    }

    void loadRates();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRates = rates ?? DEFAULT_SHIPPING_RATES;
  const totalWeightGrams = useMemo(() => computeCartWeightGrams(items), [items]);
  const shippingCents = useMemo(
    () => computeShippingCents(items, activeRates),
    [items, activeRates],
  );
  const shippingRate = useMemo(
    () => calculateShippingRate(totalWeightGrams, activeRates),
    [totalWeightGrams, activeRates],
  );

  return {
    shippingCents,
    totalWeightGrams,
    rateLabel: shippingRate.rate.label,
    rates: activeRates,
    isLoadingRates: rates === null,
  };
}
