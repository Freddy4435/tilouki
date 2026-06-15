import { describe, expect, it } from "vitest";

import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";
import {
  getProductReadinessIssues,
  isReadyToPublish,
} from "@/lib/admin/product-readiness";

const commercialImage = {
  url: "https://example.supabase.co/storage/v1/object/public/product-images/robe.jpg",
  alt: "Robe face avant",
  sortOrder: 0,
};

const completeVariant = {
  stockQuantity: 1,
  weightGrams: 120,
  isActive: true,
  priceCents: 1990,
  sizeLabel: "4 ans",
  ageLabel: null,
};

const completeProduct = {
  images: [commercialImage],
  categoryId: "cat-1",
  slug: "robe-ete-2026",
  variants: [completeVariant],
};

describe("product-readiness — publication", () => {
  it("autorise la publication avec photo commerciale et stock à 1 unité", () => {
    const issues = getProductReadinessIssues(completeProduct);
    expect(isReadyToPublish(issues)).toBe(true);
  });

  it("ignore une variante inactive indisponible si une autre est vendable", () => {
    const issues = getProductReadinessIssues({
      ...completeProduct,
      variants: [
        { ...completeVariant, stockQuantity: 0, isActive: false },
        { ...completeVariant, stockQuantity: 1, isActive: true },
      ],
    });
    expect(isReadyToPublish(issues)).toBe(true);
  });

  it("refuse si seules des variantes inactives existent", () => {
    const issues = getProductReadinessIssues({
      ...completeProduct,
      variants: [{ ...completeVariant, isActive: false }],
    });
    expect(issues.some((issue) => issue.id === "no-sellable-variant")).toBe(true);
  });

  it("refuse sans image principale", () => {
    const issues = getProductReadinessIssues({ ...completeProduct, images: [] });
    expect(issues.some((issue) => issue.id === "no-photos")).toBe(true);
  });

  it("refuse un SVG catalogue démo en image principale", () => {
    const issues = getProductReadinessIssues({
      ...completeProduct,
      images: [{ url: "/products/robe-liberty-fleurie.svg", sortOrder: 0 }],
    });
    expect(issues.some((issue) => issue.id === "demo-main-image")).toBe(true);
    expect(isReadyToPublish(issues)).toBe(false);
  });

  it("refuse un alt trop vague ou « Photo à venir »", () => {
    const shortAlt = getProductReadinessIssues({
      ...completeProduct,
      images: [{ ...commercialImage, alt: "Robe" }],
    });
    expect(shortAlt.some((issue) => issue.id === "missing-descriptive-alt")).toBe(true);
    expect(isReadyToPublish(shortAlt)).toBe(false);

    const placeholderAlt = getProductReadinessIssues({
      ...completeProduct,
      images: [{ ...commercialImage, alt: "Photo à venir" }],
    });
    expect(placeholderAlt.some((issue) => issue.id === "missing-descriptive-alt")).toBe(
      true,
    );
  });

  it("autorise la publication avec 1 photo mais signale < 3 en recommandation", () => {
    const issues = getProductReadinessIssues(completeProduct);
    expect(isReadyToPublish(issues)).toBe(true);
    expect(issues.some((issue) => issue.id === "recommended-more-photos")).toBe(true);
  });

  it("refuse une image marquée DEV", () => {
    const issues = getProductReadinessIssues({
      ...completeProduct,
      images: [
        {
          url: commercialImage.url,
          alt: "Vue [DEV] provisoire",
          sortOrder: 0,
        },
      ],
    });
    expect(issues.some((issue) => issue.id === "dev-marked-main-image")).toBe(true);
  });

  it("refuse sans prix sur variante active", () => {
    const issues = getProductReadinessIssues({
      ...completeProduct,
      variants: [{ ...completeVariant, priceCents: 0 }],
    });
    expect(issues.some((issue) => issue.id === "no-price")).toBe(true);
  });

  it("refuse sans taille ni âge", () => {
    const issues = getProductReadinessIssues({
      ...completeProduct,
      variants: [{ ...completeVariant, sizeLabel: null, ageLabel: null }],
    });
    expect(issues.some((issue) => issue.id === "no-size")).toBe(true);
  });

  it("refuse sans catégorie", () => {
    const issues = getProductReadinessIssues({ ...completeProduct, categoryId: null });
    expect(issues.some((issue) => issue.id === "no-category")).toBe(true);
  });

  it("refuse un produit de démonstration", () => {
    const issues = getProductReadinessIssues({
      ...completeProduct,
      slug: DEV_SEED_PRODUCT_SLUGS[0]!,
    });
    expect(issues.some((issue) => issue.id === "demo-product")).toBe(true);
  });
});
