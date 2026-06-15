import type { ProductListItem } from "@/types/catalog";

/** Conserve l'ordre des favoris (plus récent en dernier dans le store → affiché en premier). */
export function orderProductsByFavoriteSlugs(
  products: ProductListItem[],
  slugs: string[],
): ProductListItem[] {
  if (slugs.length === 0) return [];

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const ordered: ProductListItem[] = [];

  for (let index = slugs.length - 1; index >= 0; index -= 1) {
    const product = bySlug.get(slugs[index]);
    if (product) ordered.push(product);
  }

  return ordered;
}

export function shouldShowFavoritesEmptyState(
  favoriteCount: number,
  isLoaded: boolean,
  visibleProductCount: number,
): boolean {
  if (favoriteCount === 0) return true;
  return isLoaded && visibleProductCount === 0;
}
