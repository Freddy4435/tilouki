import { describe, expect, it } from "vitest";

import { resolveFavoriteVariantAvailability } from "@/lib/favorites/variants";
import type { ProductListItem } from "@/types/catalog";

function product(
  overrides: Partial<ProductListItem> = {},
): Pick<ProductListItem, "sizes" | "quickAddVariants" | "totalStock"> {
  return {
    sizes: [],
    quickAddVariants: [],
    totalStock: 0,
    ...overrides,
  };
}

describe("resolveFavoriteVariantAvailability", () => {
  it("sépare tailles en stock et ruptures via quickAddVariants", () => {
    const availability = resolveFavoriteVariantAvailability(
      product({
        quickAddVariants: [
          {
            id: "v1",
            sizeLabel: "4 ans",
            ageLabel: null,
            color: null,
            priceCents: 1000,
            stockQuantity: 2,
            sku: "a",
            weightGrams: 100,
          },
          {
            id: "v2",
            sizeLabel: "6 ans",
            ageLabel: null,
            color: null,
            priceCents: 1000,
            stockQuantity: 0,
            sku: "b",
            weightGrams: 100,
          },
        ],
      }),
    );

    expect(availability.available).toEqual(["4 ans"]);
    expect(availability.outOfStock).toEqual(["6 ans"]);
  });

  it("marque toutes les tailles en rupture si stock total nul", () => {
    const availability = resolveFavoriteVariantAvailability(
      product({
        sizes: ["12 mois", "18 mois"],
        totalStock: 0,
      }),
    );

    expect(availability.available).toEqual([]);
    expect(availability.outOfStock).toEqual(["12 mois", "18 mois"]);
  });
});
