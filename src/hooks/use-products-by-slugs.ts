"use client";

import { useEffect, useState } from "react";

import type { ProductListItem } from "@/types/catalog";

export function useProductsBySlugs(slugs: string[]) {
  const slugsKey = slugs.join(",");
  const shouldFetch = slugs.length > 0;
  const [products, setProducts] = useState<ProductListItem[] | null>(null);

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;

    async function load() {
      setProducts(null);

      try {
        const response = await fetch(
          `/api/products/by-slugs?slugs=${encodeURIComponent(slugsKey)}`,
        );
        if (!response.ok) {
          if (!cancelled) setProducts([]);
          return;
        }

        const data = (await response.json()) as { products?: ProductListItem[] };
        if (!cancelled) setProducts(data.products ?? []);
      } catch {
        if (!cancelled) setProducts([]);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [shouldFetch, slugsKey]);

  if (!shouldFetch) {
    return { products: [], isLoading: false };
  }

  return { products, isLoading: products === null };
}
