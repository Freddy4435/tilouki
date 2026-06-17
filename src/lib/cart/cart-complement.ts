import type { ProductListItem } from "@/types/catalog";

const DEFAULT_LIMIT = 4;

/**
 * Suggestions « compléter la tenue » pour le panier :
 * pièces du même rayon que les articles déjà présents, hors doublons.
 */
export function pickCartComplementProducts(
  cartSlugs: string[],
  pool: ProductListItem[],
  limit = DEFAULT_LIMIT,
): ProductListItem[] {
  const inCart = new Set(cartSlugs.map((slug) => slug.trim()).filter(Boolean));
  if (inCart.size === 0 || pool.length === 0) return [];

  const cartCategorySlugs = new Set(
    pool
      .filter((product) => inCart.has(product.slug))
      .map((product) => product.categorySlug)
      .filter((slug): slug is string => Boolean(slug)),
  );

  const candidates = pool.filter((product) => {
    if (inCart.has(product.slug)) return false;
    if (product.totalStock <= 0) return false;
    if (cartCategorySlugs.size === 0) return true;
    return product.categorySlug != null && cartCategorySlugs.has(product.categorySlug);
  });

  const scored = candidates.map((product) => ({
    product,
    score: scoreComplementProduct(product, cartCategorySlugs),
  }));

  scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));

  const picked: ProductListItem[] = [];
  const seenCategories = new Set<string>();

  for (const { product } of scored) {
    if (picked.length >= limit) break;
    const category = product.categorySlug ?? "__none__";
    if (seenCategories.has(category) && picked.length >= 2) continue;
    picked.push(product);
    seenCategories.add(category);
  }

  if (picked.length < limit) {
    for (const { product } of scored) {
      if (picked.length >= limit) break;
      if (picked.some((item) => item.id === product.id)) continue;
      picked.push(product);
    }
  }

  return picked.slice(0, limit);
}

function scoreComplementProduct(
  product: ProductListItem,
  cartCategories: Set<string>,
): number {
  let score = 0;
  if (product.categorySlug && cartCategories.has(product.categorySlug)) {
    score += 10;
  }
  if (product.quickAddVariants?.some((variant) => variant.stockQuantity > 0)) {
    score += 5;
  }
  if (product.totalStock > 0 && product.totalStock <= 3) {
    score += 1;
  }
  return score;
}
