import { describe, expect, it } from "vitest";

import {
  buildCataloguePreparedRows,
  computeCatalogueFacets,
  filterCataloguePreparedRows,
  matchesCataloguePreparedRow,
  shouldDisplayFacetGroup,
} from "@/lib/catalog/catalogue-facets";
import {
  mapProductListItem,
  type ProductWithRelations,
} from "@/lib/supabase/mappers/product";

function buildRow(
  overrides: Partial<ProductWithRelations> = {},
  variants: ProductWithRelations["variants"] = [],
): ProductWithRelations {
  return {
    id: "product-1",
    category_id: "cat-1",
    name: "Robe test",
    slug: "robe-test",
    short_description: null,
    description: null,
    material: "coton",
    season: "été",
    brand_label: "Tilouki",
    made_in: null,
    care_instructions: null,
    gender: "fille",
    status: "active",
    seo_title: null,
    seo_description: null,
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-01T10:00:00.000Z",
    category: { id: "cat-1", name: "Fille", slug: "fille" },
    images: [],
    variants,
    ...overrides,
  };
}

function variantRow(overrides: Partial<ProductWithRelations["variants"][number]>) {
  return {
    id: "variant-1",
    product_id: "product-1",
    sku: "SKU-1",
    size_label: "4 ans",
    age_label: "3-4 ans",
    color: "Rose",
    price_cents: 2490,
    compare_at_price_cents: null,
    cost_cents: null,
    stock_quantity: 3,
    weight_grams: 180,
    is_active: true,
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("catalogue facets", () => {
  const prepared = buildCataloguePreparedRows(
    [
      buildRow({}, [
        variantRow({ id: "v1", size_label: "4 ans", color: "Rose" }),
        variantRow({ id: "v2", size_label: "6 ans", color: "Bleu" }),
      ]),
      buildRow({ id: "product-2", slug: "short-test", name: "Short test" }, [
        variantRow({
          id: "v3",
          product_id: "product-2",
          size_label: "6 ans",
          color: "Bleu",
        }),
      ]),
    ],
    mapProductListItem,
  );

  it("filtre par taille et couleur combinées", () => {
    const filtered = filterCataloguePreparedRows(prepared, {
      sizes: ["6 ans"],
      colors: ["Bleu"],
    });

    expect(filtered).toHaveLength(2);
    expect(
      filtered.every((row) => matchesCataloguePreparedRow(row, { colors: ["Bleu"] })),
    ).toBe(true);
  });

  it("calcule les facettes sur le périmètre courant", () => {
    const facets = computeCatalogueFacets(prepared, { sizes: ["6 ans"] });

    expect(facets.colors).toEqual([
      { value: "Bleu", count: 2 },
      { value: "Rose", count: 1 },
    ]);
    expect(shouldDisplayFacetGroup(facets.colors)).toBe(true);
    expect(shouldDisplayFacetGroup([{ value: "Unique", count: 2 }])).toBe(false);
  });
});
