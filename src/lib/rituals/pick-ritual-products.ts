import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import { isProductStorefrontListed } from "@/lib/catalog/product-sellability";
import type { Ritual } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

export const RITUAL_PRODUCT_LIMIT = 6;

function productHaystack(product: ProductListItem): string {
  return `${product.name} ${product.shortDescription ?? ""} ${product.categoryName ?? ""}`.toLowerCase();
}

function keywordScore(product: ProductListItem, keywords: readonly string[]): number {
  if (keywords.length === 0) return 0;
  const haystack = productHaystack(product);
  return keywords.filter((keyword) => haystack.includes(keyword.toLowerCase())).length;
}

function sortByCategoryPriority(
  products: ProductListItem[],
  categorySlugs: readonly string[],
): ProductListItem[] {
  return [...products].sort((a, b) => {
    const aIndex = a.categorySlug ? categorySlugs.indexOf(a.categorySlug) : 99;
    const bIndex = b.categorySlug ? categorySlugs.indexOf(b.categorySlug) : 99;
    return aIndex - bIndex;
  });
}

function rankByKeywords(
  products: ProductListItem[],
  keywords: readonly string[],
): ProductListItem[] {
  if (keywords.length === 0) return products;

  const withMatches = products.filter((product) => keywordScore(product, keywords) > 0);
  const pool = withMatches.length > 0 ? withMatches : products;

  return [...pool].sort(
    (a, b) => keywordScore(b, keywords) - keywordScore(a, keywords),
  );
}

export function pickProductsForRitual(
  products: ProductListItem[],
  ritual: Ritual,
): ProductListItem[] {
  const listed = products.filter(isProductStorefrontListed);
  const keywords = ritual.productKeywords ?? [];

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

  const ranked = rankByKeywords(
    sortByCategoryPriority(pool, ritual.categorySlugs),
    keywords,
  );
  return ranked.slice(0, RITUAL_PRODUCT_LIMIT);
}
