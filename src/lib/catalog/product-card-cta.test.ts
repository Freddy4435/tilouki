import { describe, expect, it } from "vitest";

import { getProductCardCtaLabel } from "@/lib/catalog/product-card-cta";
import type { ProductQuickAddVariant } from "@/types/catalog";

function variant(id: string, stock = 3): ProductQuickAddVariant {
  return {
    id,
    sizeLabel: "4 ans",
    ageLabel: null,
    color: null,
    priceCents: 1990,
    stockQuantity: stock,
    sku: id,
    weightGrams: 200,
  };
}

describe("getProductCardCtaLabel", () => {
  it("propose de voir les tailles quand plusieurs tailles sont disponibles", () => {
    expect(getProductCardCtaLabel(["2 ans", "4 ans"], [variant("a")], true)).toBe(
      "Voir les tailles",
    );
  });

  it("propose de voir le produit pour une seule taille", () => {
    expect(getProductCardCtaLabel(["4 ans"], [variant("a")], true)).toBe(
      "Voir le produit",
    );
  });

  it("reste neutre en rupture", () => {
    expect(getProductCardCtaLabel([], [], false)).toBe("Voir le produit");
  });
});
