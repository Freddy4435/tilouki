import { describe, expect, it } from "vitest";

import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import {
  DEV_SEED_CATEGORY_SLUGS,
  DEV_SEED_LOW_PRICE_SLUGS,
  DEV_SEED_PRODUCT_SLUGS,
  DEV_SEED_SKU_PREFIX,
} from "@/lib/catalog/dev-seed.fixture";
import type { ProductListItem } from "@/types/catalog";

function mockProduct(
  slug: string,
  minPriceCents: number,
  badges: ProductListItem["badges"] = [],
): ProductListItem {
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: null,
    minPriceCents,
    compareAtPriceCents: null,
    primaryImageUrl: `/demo-products/${slug}.svg`,
    primaryImageAlt: slug,
    categorySlug: "bebe",
    categoryName: "Bébé",
    season: null,
    material: null,
    sizes: ["4 ans"],
    ageLabels: ["3-4 ans"],
    totalStock: 5,
    badges,
    createdAt: new Date().toISOString(),
  };
}

describe("dev-seed.fixture", () => {
  it("définit exactement 12 produits demo", () => {
    expect(DEV_SEED_PRODUCT_SLUGS).toHaveLength(12);
    expect(new Set(DEV_SEED_PRODUCT_SLUGS).size).toBe(12);
  });

  it("couvre les 5 familles de navigation", () => {
    expect(DEV_SEED_CATEGORY_SLUGS).toEqual(
      expect.arrayContaining(["bebe", "fille", "garcon", "pyjamas", "accessoires"]),
    );
  });

  it("préfixe les SKU demo pour purge sans risque", () => {
    expect(DEV_SEED_SKU_PREFIX).toBe("DEV-");
  });

  it("inclut des produits petits prix filtrables", () => {
    const lowPriceMocks = DEV_SEED_LOW_PRICE_SLUGS.map((slug) => {
      if (slug === "short-garcon-promo") {
        return mockProduct(slug, 1490, []);
      }
      const price = slug === "chaussettes-coton-lot3" ? 990 : 1190;
      return mockProduct(slug, price, ["low-price"]);
    });
    lowPriceMocks.find((p) => p.slug === "short-garcon-promo")!.compareAtPriceCents =
      1990;

    const filtered = filterLowPriceProducts(lowPriceMocks);
    expect(filtered.map((p) => p.slug).sort()).toEqual(
      [...DEV_SEED_LOW_PRICE_SLUGS].sort(),
    );
  });
});
