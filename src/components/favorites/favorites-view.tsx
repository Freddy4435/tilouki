"use client";

import { useMemo } from "react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
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

  return (
    <CatalogueProductList
      products={orderedProducts}
      emptyTitle="Aucun article disponible"
      emptyDescription="Les articles enregistrés ne sont plus en vente. Parcourez le catalogue pour découvrir la nouvelle sélection."
    />
  );
}

export function FavoritesView() {
  const slugKey = useFavoritesStore((state) => state.slugs.join("\0"));
  const slugs = useMemo(() => (slugKey ? slugKey.split("\0") : []), [slugKey]);

  if (slugs.length === 0) {
    return <FavoritesEmptyState />;
  }

  return <FavoritesLoadedList slugs={slugs} />;
}
