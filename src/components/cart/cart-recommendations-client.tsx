"use client";

import { useEffect, useState } from "react";

import { CartRecommendations } from "@/components/cart/cart-recommendations";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import type { ProductListItem } from "@/types/catalog";

interface CartRecommendationsClientProps {
  title?: string;
}

export function CartRecommendationsClient({ title }: CartRecommendationsClientProps) {
  const [products, setProducts] = useState<ProductListItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/cart/recommendations");
        if (!response.ok) return;
        const data = (await response.json()) as { products: ProductListItem[] };
        if (!cancelled) setProducts(data.products ?? []);
      } catch {
        if (!cancelled) setProducts([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (products === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return <CartRecommendations products={products} title={title} />;
}
