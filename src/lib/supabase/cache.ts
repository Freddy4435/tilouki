/** Tags de revalidation Next.js pour le catalogue et les contenus statiques. */
export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  shopSettings: "shop-settings",
  shippingRates: "shipping-rates",
  legal: "legal",
  reviews: "reviews",
} as const;

export function productTag(slug: string): string {
  return `product:${slug}`;
}

export function productReviewsTag(productId: string): string {
  return `product-reviews:${productId}`;
}

export function legalTag(slug: string): string {
  return `legal:${slug}`;
}

/** Durées de revalidation (secondes) */
export const REVALIDATE = {
  catalog: 300,
  product: 300,
  categories: 600,
  shopSettings: 600,
  legal: 3600,
} as const;
