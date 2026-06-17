import { describe, expect, it } from "vitest";

import { pickCartComplementProducts } from "@/lib/cart/cart-complement";
import type { ProductListItem } from "@/types/catalog";

function product(partial: Partial<ProductListItem> & Pick<ProductListItem, "id" | "slug" | "name">): ProductListItem {
  return {
    shortDescription: null,
    minPriceCents: 2000,
    compareAtPriceCents: null,
    primaryImageUrl: null,
    primaryImageAlt: null,
    categorySlug: null,
    categoryName: null,
    season: null,
    material: null,
    sizes: [],
    ageLabels: [],
    totalStock: 5,
    badges: [],
    createdAt: "2026-01-01",
    ...partial,
  };
}

describe("pickCartComplementProducts", () => {
  const pool = [
    product({ id: "1", slug: "body-bebe", name: "Body", categorySlug: "bebe" }),
    product({ id: "2", slug: "pantalon-bebe", name: "Pantalon", categorySlug: "bebe" }),
    product({ id: "3", slug: "tee-fille", name: "Tee", categorySlug: "fille" }),
    product({ id: "4", slug: "bonnet", name: "Bonnet", categorySlug: "accessoires" }),
  ];

  it("exclut les articles déjà au panier", () => {
    const result = pickCartComplementProducts(["body-bebe"], pool, 4);
    expect(result.some((item) => item.slug === "body-bebe")).toBe(false);
  });

  it("priorise le même rayon que le panier", () => {
    const result = pickCartComplementProducts(["body-bebe"], pool, 2);
    expect(result[0]?.categorySlug).toBe("bebe");
  });
});
