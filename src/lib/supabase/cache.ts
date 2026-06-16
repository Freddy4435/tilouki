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

/**
 * Durées de revalidation (secondes) — Data Cache Next.js (`unstable_cache`).
 *
 * Avec CSP à nonce (voir docs/performance-cache-tilouki.md), le HTML reste
 * rendu par requête ; ces valeurs limitent surtout les allers-retours Supabase.
 */
export const REVALIDATE = {
  catalog: 300,
  product: 300,
  categories: 600,
  shopSettings: 600,
  legal: 3600,
} as const;

/** Segments storefront avec `export const revalidate` aligné sur REVALIDATE. */
export const PAGE_REVALIDATE = {
  home: REVALIDATE.catalog,
  catalogue: REVALIDATE.catalog,
  category: REVALIDATE.catalog,
  product: REVALIDATE.product,
  ritual: REVALIDATE.catalog,
  cart: REVALIDATE.catalog,
  legal: REVALIDATE.legal,
  blog: REVALIDATE.legal,
  sitemap: 3600,
} as const;
