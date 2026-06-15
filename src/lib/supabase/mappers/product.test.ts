import { describe, expect, it } from "vitest";

import {
  deriveProductBadges,
  mapProductDetail,
  mapProductListItem,
  mapProductVariant,
  type ProductWithRelations,
} from "@/lib/supabase/mappers/product";
import { CATALOG_SEED_PRODUCTS } from "@/lib/catalog/catalog-seed.fixture";

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
  it("masque les visuels SVG démo du storefront", () => {
    const item = mapProductListItem(baseRow());

    expect(item.slug).toBe("body-bebe-coton-naturel");
    expect(item.primaryImageUrl).toBeNull();
    expect(item.secondaryImageUrl).toBeNull();
    expect(item.minPriceCents).toBe(1290);
    expect(item.sizes).toEqual(expect.arrayContaining(["3 mois", "6 mois"]));
    expect(item.totalStock).toBe(20);
    expect(item.categorySlug).toBe("bebe");
    expect(item.quickAddVariants).toHaveLength(0);
  });

  it("expose la seconde photo commerciale et les coloris", () => {
    const commercial = (path: string, alt: string, sort: number) => ({
      id: `img-${sort}`,
      product_id: "b1000001-0001-4000-8000-000000000001",
      url: path,
      alt,
      sort_order: sort,
      created_at: "2026-06-01T10:00:00.000Z",
    });

    const item = mapProductListItem(
      baseRow({
        slug: "robe-catalogue-reelle",
        images: [
          commercial(
            "https://example.supabase.co/storage/v1/object/public/product-images/face.jpg",
            "Robe liberty face avant",
            0,
          ),
          commercial(
            "https://example.supabase.co/storage/v1/object/public/product-images/bleu.jpg",
            "Coloris bleu",
            1,
          ),
          commercial(
            "https://example.supabase.co/storage/v1/object/public/product-images/rose.jpg",
            "Coloris rose",
            2,
          ),
        ],
        variants: [
          {
            ...baseRow().variants[0]!,
            color: "Bleu",
          },
          {
            ...baseRow().variants[1]!,
            color: "Rose",
          },
        ],
      }),
    );

    expect(item.primaryImageUrl).toBe(
      "https://example.supabase.co/storage/v1/object/public/product-images/face.jpg",
    );
    expect(item.quickAddVariants?.length ?? 0).toBeGreaterThan(0);
    expect(item.secondaryImageUrl).toBe(
      "https://example.supabase.co/storage/v1/object/public/product-images/bleu.jpg",
    );
    expect(item.colorOptions).toEqual([
      {
        color: "Bleu",
        imageUrl:
          "https://example.supabase.co/storage/v1/object/public/product-images/bleu.jpg",
      },
      {
        color: "Rose",
        imageUrl:
          "https://example.supabase.co/storage/v1/object/public/product-images/rose.jpg",
      },
    ]);
  });

  it("masque les SVG catalogue /products/ sur le storefront", () => {
    const catalog = CATALOG_SEED_PRODUCTS[0]!;
    const row = baseRow({
      slug: catalog.slug,
      name: catalog.name,
      material: catalog.material,
      season: catalog.season,
      images: [
        {
          id: "img-cat-1",
          product_id: "b1000001-0001-4000-8000-000000000001",
          url: `/products/${catalog.imageSlug}.svg`,
          alt: catalog.name,
          sort_order: 0,
          created_at: "2026-06-01T10:00:00.000Z",
        },
      ],
      variants: catalog.variants.map((v, i) => ({
        id: `v-cat-${i}`,
        product_id: "b1000001-0001-4000-8000-000000000001",
        sku: v.sku,
        size_label: v.size,
        age_label: v.age,
        color: v.color,
        price_cents: Math.round(parseFloat(v.priceEur.replace(",", ".")) * 100),
        compare_at_price_cents: null,
        cost_cents: null,
        stock_quantity: v.stock,
        weight_grams: v.weight,
        is_active: true,
        created_at: "2026-06-01T10:00:00.000Z",
        updated_at: "2026-06-01T10:00:00.000Z",
      })),
    });

    const item = mapProductListItem(row);
    expect(item.primaryImageUrl).toBeNull();
    expect(item.minPriceCents).toBe(1290);
    expect(item.ageLabels).toEqual(expect.arrayContaining(["0-3 mois", "3-6 mois"]));
    expect(item.totalStock).toBe(37);
  });
});

describe("mapProductVariant", () => {
  it("mappe taille, âge et poids en grammes", () => {
    const variant = mapProductVariant(baseRow().variants[0]!);
    expect(variant.sizeLabel).toBe("3 mois");
    expect(variant.ageLabel).toBe("0-3 mois");
    expect(variant.weightGrams).toBe(150);
    expect(variant.priceCents).toBe(1290);
  });
});

describe("mapProductDetail", () => {
  it("expose toutes les variantes actives avec poids pour le panier", () => {
    const detail = mapProductDetail(baseRow());
    expect(detail.variants).toHaveLength(2);
    expect(
      detail.variants.every((v) => v.weightGrams != null && v.weightGrams > 0),
    ).toBe(true);
  });

  it("n'expose pas les images SVG techniques dans la galerie", () => {
    const detail = mapProductDetail(baseRow());
    expect(detail.images).toHaveLength(0);
  });
});
