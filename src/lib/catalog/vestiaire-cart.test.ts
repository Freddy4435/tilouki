import { describe, expect, it } from "vitest";

import {
  buildCapsuleCartLines,
  summarizeCapsuleAddToCart,
} from "@/lib/catalog/vestiaire-cart";
import type { ProductListItem } from "@/types/catalog";

function product(partial: Partial<ProductListItem> & Pick<ProductListItem, "id" | "slug" | "name">): ProductListItem {
  return {
    shortDescription: null,
    minPriceCents: 1500,
    compareAtPriceCents: null,
    primaryImageUrl: "/img.jpg",
    primaryImageAlt: null,
    categorySlug: "bebe",
    categoryName: "Bébé",
    season: null,
    material: null,
    sizes: ["6 mois"],
    ageLabels: [],
    totalStock: 2,
    badges: [],
    createdAt: "2026-01-01",
    quickAddVariants: [
      {
        id: "v1",
        sizeLabel: "6 mois",
        ageLabel: null,
        color: null,
        priceCents: 1500,
        stockQuantity: 2,
        sku: "SKU-1",
        weightGrams: 200,
      },
    ],
    ...partial,
  };
}

describe("vestiaire-cart", () => {
  it("construit les lignes panier pour les variantes en stock", () => {
    const lines = buildCapsuleCartLines([
      product({ id: "1", slug: "a", name: "Body" }),
      product({
        id: "2",
        slug: "b",
        name: "Pantalon",
        quickAddVariants: [
          {
            id: "v2",
            sizeLabel: "4 ans",
            ageLabel: null,
            color: null,
            priceCents: 2000,
            stockQuantity: 0,
            sku: "SKU-2",
            weightGrams: 300,
          },
        ],
      }),
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]?.slug).toBe("a");
    expect(summarizeCapsuleAddToCart([], lines).addedCount).toBe(1);
  });
});
