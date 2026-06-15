import { describe, expect, it } from "vitest";

import { orderProductsByRecentlyViewedSlugs } from "@/lib/recently-viewed/display";
import type { ProductListItem } from "@/types/catalog";

function product(slug: string): ProductListItem {
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: null,
    minPriceCents: 1000,
    compareAtPriceCents: null,
    primaryImageUrl: null,
    primaryImageAlt: null,
    categorySlug: null,
    categoryName: null,
    season: null,
    material: null,
    sizes: [],
    ageLabels: [],
    badges: [],
    totalStock: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    ratingAverage: null,
    ratingCount: 0,
  };
}

describe("orderProductsByRecentlyViewedSlugs", () => {
  it("conserve l'ordre des slugs récents", () => {
    const ordered = orderProductsByRecentlyViewedSlugs(
      [product("b"), product("a"), product("c")],
      ["c", "a"],
    );

    expect(ordered.map((item) => item.slug)).toEqual(["c", "a"]);
  });
});
