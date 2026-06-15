/**
 * Catalogue vendable Tilouki — 20 produits enfants (hors démo DEV).
 * Source : data/catalog-products.json (régénéré via npm run generate:catalog).
 */

import catalogData from "../../../data/catalog-products.json";

export const CATALOG_SEED_NOTICE =
  "Catalogue Tilouki — produits vendables (SKU TK-). Distinct des produits démo DEV-.";

export const CATALOG_SKU_PREFIX = "TK-";

export interface CatalogSeedVariant {
  size: string;
  age: string;
  color: string;
  priceEur: string;
  costEur?: string;
  stock: number;
  weight: number;
  sku: string;
}

export interface CatalogSeedProduct {
  reference: string;
  slug: string;
  category: string;
  name: string;
  shortDescription: string;
  description: string;
  material: string;
  season: string;
  madeIn: string;
  gender: "fille" | "garcon" | "mixte";
  imageSlug: string;
  accent: string;
  variants: CatalogSeedVariant[];
}

export const CATALOG_SEED_PRODUCTS = catalogData.products as CatalogSeedProduct[];

export const CATALOG_SEED_PRODUCT_SLUGS = CATALOG_SEED_PRODUCTS.map((p) => p.slug);

export function getCatalogProductBySlug(slug: string): CatalogSeedProduct | undefined {
  return CATALOG_SEED_PRODUCTS.find((p) => p.slug === slug);
}

export function getCatalogVariantWeights(slug: string): number[] {
  const product = getCatalogProductBySlug(slug);
  return product?.variants.map((v) => v.weight) ?? [];
}
