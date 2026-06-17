"use client";

import { useEffect, useState } from "react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import type { ProductListItem } from "@/types/catalog";

interface CartComplementSectionProps {
  cartSlugs: string[];
  compact?: boolean;
}

interface ResolvedComplements {
  slugsKey: string;
  products: ProductListItem[];
}

export function CartComplementSection({
  cartSlugs,
  compact = false,
}: CartComplementSectionProps) {
  const slugsKey = cartSlugs.join(",");
  const [resolved, setResolved] = useState<ResolvedComplements | null>(null);

  useEffect(() => {
    if (!slugsKey) return;

    const controller = new AbortController();

    void fetch(`/api/cart/recommendations?slugs=${encodeURIComponent(slugsKey)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { products?: ProductListItem[] }) => {
        if (controller.signal.aborted) return;
        setResolved({ slugsKey, products: data.products ?? [] });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setResolved({ slugsKey, products: [] });
      });

    return () => controller.abort();
  }, [slugsKey]);

  if (!slugsKey) return null;

  const loading = resolved?.slugsKey !== slugsKey;
  const products = resolved?.slugsKey === slugsKey ? resolved.products : [];

  if (loading || products.length === 0) return null;

  return (
    <section
      aria-labelledby={compact ? "cart-complement-drawer-heading" : "cart-complement-heading"}
      className={compact ? "space-y-3 px-1 pt-2" : "border-t pt-10"}
    >
      <header className={compact ? "px-0" : "mb-4"}>
        <h2
          id={compact ? "cart-complement-drawer-heading" : "cart-complement-heading"}
          className={compact ? "text-sm font-semibold" : "text-section-title text-lg"}
        >
          Compléter la tenue
        </h2>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Pièces assorties au même rayon que votre sélection.
        </p>
      </header>
      <CatalogueProductList
        products={products}
        layout={compact ? "scroll-mobile" : "grid"}
        priorityLimit={0}
      />
    </section>
  );
}
