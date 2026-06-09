import type { ProductListItem, ProductSort } from "@/types/catalog";

export function sortProducts(
  products: ProductListItem[],
  sort: ProductSort = "newest",
): ProductListItem[] {
  const sorted = [...products];

  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.minPriceCents - b.minPriceCents);
    case "price_desc":
      return sorted.sort((a, b) => b.minPriceCents - a.minPriceCents);
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

export function filterLowPriceProducts(products: ProductListItem[]): ProductListItem[] {
  return products.filter(
    (p) =>
      p.badges.includes("low-price") ||
      (p.compareAtPriceCents != null && p.compareAtPriceCents > p.minPriceCents),
  );
}
