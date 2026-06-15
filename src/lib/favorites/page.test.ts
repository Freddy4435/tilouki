import { describe, expect, it } from "vitest";

import {
  orderProductsByFavoriteSlugs,
  shouldShowFavoritesEmptyState,
} from "@/lib/favorites/page";
import { formatFavoritesCount, buildFavoritesAriaLabel } from "@/lib/favorites/display";
import type { ProductListItem } from "@/types/catalog";

function product(slug: string): ProductListItem {
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: null,
    season: null,
    material: null,
    categoryName: null,
    categorySlug: null,
    minPriceCents: 1000,
    compareAtPriceCents: null,
    primaryImageUrl: null,
    primaryImageAlt: null,
    sizes: [],
    ageLabels: [],
    badges: [],
    totalStock: 5,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("favorites page", () => {
  it("ordonne les produits selon les slugs favoris (dernier ajouté en premier)", () => {
    const ordered = orderProductsByFavoriteSlugs(
      [product("a"), product("b"), product("c")],
      ["a", "b", "c"],
    );
    expect(ordered.map((item) => item.slug)).toEqual(["c", "b", "a"]);
  });

  it("affiche l'état vide sans favoris ou sans produits visibles", () => {
    expect(shouldShowFavoritesEmptyState(0, false, 0)).toBe(true);
    expect(shouldShowFavoritesEmptyState(2, true, 0)).toBe(true);
    expect(shouldShowFavoritesEmptyState(2, true, 2)).toBe(false);
    expect(shouldShowFavoritesEmptyState(2, false, 0)).toBe(false);
  });

  it("formate le compteur du header", () => {
    expect(formatFavoritesCount(0)).toBeNull();
    expect(formatFavoritesCount(3)).toBe("3");
    expect(formatFavoritesCount(12)).toBe("9+");
  });

  it("formate le libellé aria du déclencheur header", () => {
    expect(buildFavoritesAriaLabel(0)).toBe("Voir mes favoris");
    expect(buildFavoritesAriaLabel(1)).toBe("Voir mes favoris, 1 article");
    expect(buildFavoritesAriaLabel(4)).toBe("Voir mes favoris, 4 articles");
  });
});
