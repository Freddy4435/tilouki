import { describe, expect, it } from "vitest";

import { deriveProductBadges, mapProductListItem, type ProductWithRelations } from "@/lib/supabase/mappers/product";

function baseRow(overrides: Partial<ProductWithRelations> = {}): ProductWithRelations {
  return {
    id: "b1000001-0001-4000-8000-000000000001",
    category_id: null,
    name: "Body bébé coton naturel",
    slug: "body-bebe-coton-naturel",
    short_description: "Body doux",
    description: null,
    material: "100 % coton bio",
    season: "Printemps-été",
    brand_label: "Tilouki démo",
    made_in: "Portugal",
    care_instructions: null,
    gender: "mixte",
    status: "active",
    seo_title: null,
    seo_description: null,
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-01T10:00:00.000Z",
    category: { id: "c1", name: "Bébé", slug: "bebe" },
    images: [
      {
        id: "img-1",
        product_id: "b1000001-0001-4000-8000-000000000001",
        url: "/demo-products/body-bebe-coton-naturel.svg",
        alt: "Body bébé — visuel démo",
        sort_order: 0,
        created_at: "2026-06-01T10:00:00.000Z",
      },
    ],
    variants: [
      {
        id: "v1",
        product_id: "b1000001-0001-4000-8000-000000000001",
        sku: "DEV-BODY-BEBE-3M",
        size_label: "3 mois",
        age_label: "0-3 mois",
        color: "Naturel",
        price_cents: 1290,
        compare_at_price_cents: null,
        cost_cents: null,
        stock_quantity: 12,
        weight_grams: 150,
        is_active: true,
        created_at: "2026-06-01T10:00:00.000Z",
        updated_at: "2026-06-01T10:00:00.000Z",
      },
      {
        id: "v2",
        product_id: "b1000001-0001-4000-8000-000000000001",
        sku: "DEV-BODY-BEBE-6M",
        size_label: "6 mois",
        age_label: "3-6 mois",
        color: "Naturel",
        price_cents: 1390,
        compare_at_price_cents: null,
        cost_cents: null,
        stock_quantity: 8,
        weight_grams: 160,
        is_active: true,
        created_at: "2026-06-01T10:00:00.000Z",
        updated_at: "2026-06-01T10:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("deriveProductBadges", () => {
  it("ajoute cotton et spring-summer pour un body coton été", () => {
    const badges = deriveProductBadges(
      { material: "100 % coton bio", season: "Printemps-été" },
      baseRow().variants,
    );
    expect(badges).toContain("cotton");
    expect(badges).toContain("spring-summer");
  });

  it("signale last-piece quand le stock total vaut 1", () => {
    const variants = baseRow().variants.map((v, i) =>
      i === 0 ? { ...v, stock_quantity: 1 } : { ...v, stock_quantity: 0 },
    );
    const badges = deriveProductBadges({ material: "", season: "" }, variants);
    expect(badges).toContain("last-piece");
  });

  it("signale low-price sous 15 €", () => {
    const variants = baseRow().variants.map((v) => ({ ...v, price_cents: 1190 }));
    const badges = deriveProductBadges({ material: "", season: "" }, variants);
    expect(badges).toContain("low-price");
  });
});

describe("mapProductListItem", () => {
  it("mappe image locale, prix min et tailles depuis les variantes demo", () => {
    const item = mapProductListItem(baseRow());

    expect(item.slug).toBe("body-bebe-coton-naturel");
    expect(item.primaryImageUrl).toBe("/demo-products/body-bebe-coton-naturel.svg");
    expect(item.minPriceCents).toBe(1290);
    expect(item.sizes).toEqual(expect.arrayContaining(["3 mois", "6 mois"]));
    expect(item.totalStock).toBe(20);
    expect(item.categorySlug).toBe("bebe");
  });
});
