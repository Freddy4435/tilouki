import type { ProductListItem } from "@/types/catalog";

export { recentSlugsFromEntries } from "@/lib/recently-viewed/slugs";

/** Conserve l'ordre « vu récemment » (plus récent en premier). */
export function orderProductsByRecentlyViewedSlugs(
  products: ProductListItem[],
  slugs: string[],
): ProductListItem[] {
  if (slugs.length === 0) return [];

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const ordered: ProductListItem[] = [];

  for (const slug of slugs) {
    const product = bySlug.get(slug);
    if (product) ordered.push(product);
  }

  return ordered;
}
