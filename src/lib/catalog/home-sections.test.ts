import { describe, expect, it } from "vitest";

import {
  buildReadyLooks,
  getCurrentWednesdayStart,
  hasMinimumHomeProducts,
  HOME_RAYONS,
  pickBebeOrPyjamasHomeSpotlight,
  pickCategoryProducts,
  pickLastPieceProducts,
  pickWednesdayNewProducts,
  pickWeeklyNewProducts,
  resolveWeeklyNewProducts,
} from "@/lib/catalog/home-sections";
import type { ProductListItem } from "@/types/catalog";

function product(
  overrides: Partial<ProductListItem> & Pick<ProductListItem, "slug">,
): ProductListItem {
  const { slug, ...rest } = overrides;
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: null,
    minPriceCents: 1990,
    compareAtPriceCents: null,
    primaryImageUrl: "/products/test.jpg",
    primaryImageAlt: null,
    categorySlug: "bebe",
    categoryName: "Bébé",
    season: null,
    material: null,
    sizes: [],
    ageLabels: [],
    totalStock: 5,
    badges: [],
    createdAt: new Date().toISOString(),
    ...rest,
  };
}

describe("pickWeeklyNewProducts", () => {
  it("retient les produits des 7 derniers jours", () => {
    const now = Date.now();
    const recent = product({
      slug: "recent",
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const old = product({
      slug: "old",
      createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(pickWeeklyNewProducts([old, recent], now).map((item) => item.slug)).toEqual([
      "recent",
    ]);
  });
});

describe("pickWednesdayNewProducts", () => {
  it("retient les produits depuis le mercredi courant", () => {
    const wednesday = getCurrentWednesdayStart(new Date("2026-06-11T12:00:00"));
    const before = product({
      slug: "before",
      createdAt: new Date(wednesday.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    });
    const after = product({
      slug: "after",
      createdAt: new Date(wednesday.getTime() + 60 * 60 * 1000).toISOString(),
    });

    expect(
      pickWednesdayNewProducts(
        [before, after],
        new Date("2026-06-11T12:00:00").getTime(),
      ).map((item) => item.slug),
    ).toEqual(["after"]);
  });
});

describe("resolveWeeklyNewProducts", () => {
  it("retombe sur les dernières arrivées si la semaine est vide", () => {
    const now = Date.now();
    const older = product({
      slug: "older",
      createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(resolveWeeklyNewProducts([older], now)).toHaveLength(1);
  });
});

describe("hasMinimumHomeProducts", () => {
  it("exige au moins 3 produits par défaut", () => {
    expect(hasMinimumHomeProducts([product({ slug: "a" })])).toBe(false);
    expect(
      hasMinimumHomeProducts([
        product({ slug: "a" }),
        product({ slug: "b" }),
        product({ slug: "c" }),
      ]),
    ).toBe(true);
  });
});

describe("pickLastPieceProducts", () => {
  it("priorise le stock le plus bas", () => {
    const items = [
      product({ slug: "a", totalStock: 3 }),
      product({ slug: "b", totalStock: 1 }),
      product({ slug: "c", totalStock: 10 }),
    ];

    expect(pickLastPieceProducts(items).map((item) => item.slug)).toEqual(["b", "a"]);
  });
});

describe("pickBebeOrPyjamasHomeSpotlight", () => {
  it("choisit bébé quand la catégorie est la mieux fournie", () => {
    const items = [
      product({ slug: "b1", categorySlug: "bebe" }),
      product({ slug: "b2", categorySlug: "bebe" }),
      product({ slug: "b3", categorySlug: "bebe" }),
      product({ slug: "p1", categorySlug: "pyjamas" }),
    ];

    const spotlight = pickBebeOrPyjamasHomeSpotlight(items);
    expect(spotlight?.title).toBe("Sélection bébé");
    expect(spotlight?.products).toHaveLength(3);
  });

  it("retombe sur pyjamas si bébé est insuffisant", () => {
    const items = [
      product({ slug: "p1", categorySlug: "pyjamas" }),
      product({ slug: "p2", categorySlug: "pyjamas" }),
      product({ slug: "p3", categorySlug: "pyjamas" }),
    ];

    const spotlight = pickBebeOrPyjamasHomeSpotlight(items);
    expect(spotlight?.title).toBe("Sélection pyjamas");
  });
});

describe("pickCategoryProducts", () => {
  it("filtre par slug de catégorie", () => {
    const items = [
      product({ slug: "bebe-1", categorySlug: "bebe" }),
      product({ slug: "pyjama-1", categorySlug: "pyjamas" }),
    ];

    expect(pickCategoryProducts(items, "pyjamas").map((item) => item.slug)).toEqual([
      "pyjama-1",
    ]);
  });
});

describe("HOME_RAYONS", () => {
  it("expose les cinq rayons vitrine", () => {
    expect(HOME_RAYONS.map((rayon) => rayon.id)).toEqual([
      "bebe",
      "fille",
      "garcon",
      "pyjamas",
      "petits-prix",
    ]);
  });
});

describe("buildReadyLooks", () => {
  it("propose des looks produits quand une catégorie en a au moins 2", () => {
    const looks = buildReadyLooks([
      product({ slug: "p1", categorySlug: "pyjamas" }),
      product({ slug: "p2", categorySlug: "pyjamas" }),
    ]);

    expect(looks[0]?.products).toHaveLength(2);
    expect(looks[0]?.editorialOnly).toBeFalsy();
  });

  it("retombe sur des conseils éditoriaux sans produits", () => {
    const looks = buildReadyLooks([product({ slug: "solo", categorySlug: "bebe" })]);

    expect(looks.length).toBeGreaterThanOrEqual(2);
    expect(looks.every((look) => look.editorialOnly)).toBe(true);
  });
});
