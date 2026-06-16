import { describe, expect, it } from "vitest";

import { buildProductJsonLd, buildArticleJsonLd } from "@/lib/seo/json-ld";
import type { ProductDetail } from "@/types/catalog";

function product(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    id: "p1",
    slug: "robe-test",
    name: "Robe test",
    shortDescription: "Robe",
    description: "Robe",
    minPriceCents: 2500,
    compareAtPriceCents: null,
    primaryImageUrl: "/robe.svg",
    primaryImageAlt: "Robe",
    categorySlug: "fille",
    categoryName: "Fille",
    season: null,
    material: null,
    sizes: ["4 ans"],
    ageLabels: ["3-4 ans"],
    totalStock: 3,
    badges: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    brandLabel: "Tilouki",
    madeIn: null,
    careInstructions: null,
    gender: "fille",
    seoTitle: null,
    seoDescription: null,
    categoryId: "c1",
    images: [{ id: "i1", url: "/robe.svg", alt: "Robe", sortOrder: 0 }],
    variants: [
      {
        id: "v1",
        sku: "SKU-1",
        sizeLabel: "4 ans",
        ageLabel: "3-4 ans",
        color: "Rose",
        priceCents: 2500,
        compareAtPriceCents: null,
        stockQuantity: 3,
        weightGrams: 200,
        isActive: true,
      },
    ],
    ...overrides,
  };
}

describe("buildProductJsonLd", () => {
  it("ajoute AggregateRating uniquement avec des avis publiés", () => {
    const withoutRating = buildProductJsonLd(product());
    expect(withoutRating.aggregateRating).toBeUndefined();

    const withRating = buildProductJsonLd(
      product({ ratingAverage: 4.6, ratingCount: 12 }),
    );
    expect(withRating.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: "4.6",
      reviewCount: 12,
      bestRating: "5",
      worstRating: "1",
    });
  });
});

describe("buildArticleJsonLd", () => {
  it("expose les champs Article essentiels", () => {
    const json = buildArticleJsonLd({
      title: "Guide d'achat tailles enfant",
      description: "Conseils tailles enfants",
      slug: "choisir-bonne-taille-vetement-enfant",
      publishedAt: "2026-03-19",
      categoryLabel: "Tailles",
      imageUrl: "https://tilouki.fr/editorial/size-guide.webp",
    });

    expect(json["@type"]).toBe("Article");
    expect(json.headline).toBe("Guide d'achat tailles enfant");
    expect(json.articleSection).toBe("Tailles");
    expect(json.datePublished).toBe("2026-03-19");
    expect(json.mainEntityOfPage).toMatchObject({
      "@type": "WebPage",
      "@id": expect.stringContaining("/blog/choisir-bonne-taille-vetement-enfant"),
    });
  });
});
