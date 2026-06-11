"use client";

import { useEffect, useMemo, useState } from "react";

import { useCartStore } from "@/lib/cart/store";
import {
  calculateShippingRate,
  computeCartWeightGrams,
  getDefaultRatesForCarrier,
} from "@/lib/shipping/rates";
import type { CarrierInfo, CarrierName, ShippingRate } from "@/lib/shipping/types";

interface RatesResponse {
  rates?: ShippingRate[];
  ratesByCarrier?: Partial<Record<CarrierName, ShippingRate[]>>;
  carriers?: CarrierInfo[];
}

/** Devis indicatif d'un transporteur pour le panier courant. */
export interface CarrierQuote {
  carrier: CarrierName;
  shippingCents: number;
  rateLabel: string;
}

const FALLBACK_CARRIERS: CarrierInfo[] = [
  {
    id: "mondial_relay",
    label: "Mondial Relay",
    methodLabel: "Point relais",
    estimatedDelay: "3 à 5 jours ouvrés",
    devMock: false,
  },
];

/**
 * Frais de livraison du panier pour le transporteur sélectionné, plus le
 * devis de chaque transporteur disponible (sélecteur de l'étape livraison).
 */
export function useCartShipping(carrier?: CarrierName) {
  const items = useCartStore((s) => s.items);
  const storeCarrier = useCartStore((s) => s.carrier);
  const selectedCarrier = carrier ?? storeCarrier;
  const [data, setData] = useState<RatesResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      try {
        const response = await fetch("/api/shipping/rates", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as RatesResponse;
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setData({});
      }
    }

    void loadRates();
    return () => {
      cancelled = true;
    };
  }, []);

  const carriers = data?.carriers?.length ? data.carriers : FALLBACK_CARRIERS;

  const ratesFor = useMemo(() => {
    return (target: CarrierName): ShippingRate[] => {
      const fromApi = data?.ratesByCarrier?.[target];
      if (fromApi?.length) return fromApi;
      // Compat ancien format (barème MR seul dans `rates`).
      if (target === "mondial_relay" && data?.rates?.length) return data.rates;
      return getDefaultRatesForCarrier(target);
    };
  }, [data]);

  const totalWeightGrams = useMemo(() => computeCartWeightGrams(items), [items]);

  const quotes = useMemo<CarrierQuote[]>(
    () =>
      carriers.map((info) => {
        const result = calculateShippingRate(totalWeightGrams, ratesFor(info.id));
        return {
          carrier: info.id,
          shippingCents: items.length === 0 ? 0 : result.priceCents,
          rateLabel: result.rate.label,
        };
      }),
    [carriers, items.length, ratesFor, totalWeightGrams],
  );

  const activeRates = ratesFor(selectedCarrier);
  const shippingRate = useMemo(
    () => calculateShippingRate(totalWeightGrams, activeRates),
    [totalWeightGrams, activeRates],
  );
  const shippingCents = items.length === 0 ? 0 : shippingRate.priceCents;

  return {
    carrier: selectedCarrier,
    carriers,
    quotes,
    shippingCents,
    totalWeightGrams,
    rateLabel: shippingRate.rate.label,
    rates: activeRates,
    isLoadingRates: data === null,
  };
}
