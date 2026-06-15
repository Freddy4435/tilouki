import { describe, expect, it } from "vitest";

import {
  CATALOG_SEED_PRODUCTS,
  CATALOG_SEED_PRODUCT_SLUGS,
  CATALOG_SKU_PREFIX,
  getCatalogVariantWeights,
} from "@/lib/catalog/catalog-seed.fixture";

describe("catalog-seed.fixture", () => {
  it("définit 20 produits vendables distincts des démo DEV-", () => {
    expect(CATALOG_SEED_PRODUCTS).toHaveLength(20);
    expect(CATALOG_SEED_PRODUCT_SLUGS).toHaveLength(20);
    expect(new Set(CATALOG_SEED_PRODUCT_SLUGS).size).toBe(20);
  });

  it("chaque produit a au moins 2 variantes avec poids et SKU TK-", () => {
    for (const product of CATALOG_SEED_PRODUCTS) {
      expect(product.variants.length).toBeGreaterThanOrEqual(2);
      for (const variant of product.variants) {
        expect(variant.sku.startsWith(CATALOG_SKU_PREFIX)).toBe(true);
        expect(variant.weight).toBeGreaterThan(0);
        expect(variant.stock).toBeGreaterThan(0);
      }
    }
  });

  it("expose les poids par slug pour les tests de livraison", () => {
    const weights = getCatalogVariantWeights("body-bebe-coton-bio");
    expect(weights).toEqual([145, 155, 165]);
  });
});
