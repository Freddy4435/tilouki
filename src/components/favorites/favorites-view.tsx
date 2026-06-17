"use client";

import { useMemo } from "react";

import { FavoritesProductList } from "@/components/favorites/favorites-product-list";
import { FavoritesEmptyState } from "@/components/favorites/favorites-empty-state";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { useProductsBySlugs } from "@/hooks/use-products-by-slugs";
import { orderProductsByFavoriteSlugs } from "@/lib/favorites/page";
import { useFavoritesStore } from "@/lib/favorites/store";

interface FavoritesLoadedListProps {
  slugs: string[];
}

function FavoritesLoadedList({ slugs }: FavoritesLoadedListProps) {
  const { products, isLoading } = useProductsBySlugs(slugs);

  const orderedProducts = useMemo(
    () => (products ? orderProductsByFavoriteSlugs(products, slugs) : []),
    [products, slugs],
  );

  if (isLoading) {
    return <ProductGridSkeleton count={Math.min(slugs.length, 4)} />;
  }

  if (orderedProducts.length === 0) {
    return (
      <div className="border-tilouki-border/60 bg-muted/20 rounded-[var(--radius-card)] border px-4 py-8 text-center">
        <p className="font-semibold">Articles plus disponibles</p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Vos favoris enregistrés ne sont plus en vente. Parcourez le catalogue pour
          découvrir la sélection actuelle.
        </p>
      </div>
    );
  }

  return <FavoritesProductList products={orderedProducts} />;
}

export function FavoritesView() {
  const slugKey = useFavoritesStore((state) => state.slugs.join("\0"));
  const slugs = useMemo(() => (slugKey ? slugKey.split("\0") : []), [slugKey]);

  if (slugs.length === 0) {
    return <FavoritesEmptyState />;
  }

  return <FavoritesLoadedList slugs={slugs} />;
}
