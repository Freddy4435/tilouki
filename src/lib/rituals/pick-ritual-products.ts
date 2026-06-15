import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import { isProductStorefrontListed } from "@/lib/catalog/product-sellability";
import type { Ritual } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

export const RITUAL_PRODUCT_LIMIT = 6;

export function pickProductsForRitual(
  products: ProductListItem[],
  ritual: Ritual,
): ProductListItem[] {
  const listed = products.filter(isProductStorefrontListed);

  if (ritual.slug === "petit-budget") {
    const inCategories = listed.filter(
      (product) =>
        product.categorySlug && ritual.categorySlugs.includes(product.categorySlug),
    );
    const lowPrice = filterLowPriceProducts(inCategories);
    if (lowPrice.length > 0) {
      return lowPrice.slice(0, RITUAL_PRODUCT_LIMIT);
    }
    return [...inCategories]
      .sort((a, b) => a.minPriceCents - b.minPriceCents)
      .slice(0, RITUAL_PRODUCT_LIMIT);
  }

  const pool = listed.filter(
    (product) =>
      product.categorySlug && ritual.categorySlugs.includes(product.categorySlug),
  );

  return pool.slice(0, RITUAL_PRODUCT_LIMIT);
}
