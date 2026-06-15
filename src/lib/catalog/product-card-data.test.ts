import { describe, expect, it } from "vitest";

import { resolveColorSwatch } from "@/lib/catalog/color-swatches";
import {
  canShowProductCardQuickAdd,
  deriveColorOptions,
  deriveQuickAddVariants,
  deriveSecondaryImage,
  formatQuickAddVariantLabel,
  getVisibleColorOptions,
  resolveQuickAddMode,
  shouldShowSecondaryImage,
} from "@/lib/catalog/product-card-data";
import type { ProductVariant } from "@/types/catalog";

function variant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: "v1",
    sku: "SKU-1",
    sizeLabel: "4 ans",
    ageLabel: "3-4 ans",
    color: "Bleu",
    priceCents: 1990,
    compareAtPriceCents: null,
    stockQuantity: 3,
    weightGrams: 200,
    isActive: true,
    ...overrides,
  };
}

describe("deriveSecondaryImage", () => {
  it("retourne null avec une seule image", () => {
    expect(deriveSecondaryImage([{ url: "/a.svg", alt: "A", sortOrder: 0 }])).toEqual({
      url: null,
      alt: null,
    });
  });

  it("expose la 2e image triée par sort_order", () => {
    expect(
      deriveSecondaryImage([
        { url: "/b.svg", alt: "Dos", sortOrder: 1 },
        { url: "/a.svg", alt: "Face", sortOrder: 0 },
      ]),
    ).toEqual({ url: "/b.svg", alt: "Dos" });
  });
});

describe("deriveColorOptions", () => {
  it("ignore un produit à une seule couleur", () => {
    expect(
      deriveColorOptions(
        [{ color: "Rose", isActive: true }],
        [{ url: "/a.svg", alt: "Rose", sortOrder: 0 }],
      ),
    ).toEqual([]);
  });

  it("dérive les coloris distincts avec image associée", () => {
    const options = deriveColorOptions(
      [
        { color: "Bleu", isActive: true },
        { color: "Rose", isActive: true },
        { color: "Bleu", isActive: true },
      ],
      [
        { url: "/face.svg", alt: "Vue principale", sortOrder: 0 },
        { url: "/bleu.svg", alt: "Coloris bleu", sortOrder: 1 },
        { url: "/rose.svg", alt: "Coloris rose", sortOrder: 2 },
      ],
    );

    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({ color: "Bleu", imageUrl: "/bleu.svg" });
    expect(options[1]).toEqual({ color: "Rose", imageUrl: "/rose.svg" });
  });

  it("limite l'affichage à 4 pastilles + overflow", () => {
    const options = Array.from({ length: 6 }, (_, index) => ({
      color: `Couleur ${index + 1}`,
      imageUrl: `/c${index}.svg`,
    }));
    const { visible, overflow } = getVisibleColorOptions(options);
    expect(visible).toHaveLength(4);
    expect(overflow).toBe(2);
  });
});

describe("resolveColorSwatch", () => {
  it("mappe les libellés FR courants", () => {
    expect(resolveColorSwatch("Bleu marine").isNeutral).toBe(false);
    expect(resolveColorSwatch("inconnu").isNeutral).toBe(true);
  });
});

describe("resolveQuickAddMode", () => {
  it("ajoute directement avec une seule variante en stock", () => {
    const variants = deriveQuickAddVariants([variant()]);
    expect(resolveQuickAddMode(variants)).toEqual({
      mode: "direct",
      directVariant: variants[0],
    });
  });

  it("ouvre un sélecteur avec plusieurs tailles", () => {
    const variants = deriveQuickAddVariants([
      variant({ id: "v1", sizeLabel: "3 ans" }),
      variant({ id: "v2", sizeLabel: "4 ans" }),
    ]);
    expect(resolveQuickAddMode(variants)).toEqual({ mode: "picker" });
  });

  it("formate le libellé variante", () => {
    expect(formatQuickAddVariantLabel(variant())).toBe("4 ans · 3-4 ans · Bleu");
  });
});

describe("shouldShowSecondaryImage", () => {
  it("masque la 2e image si identique à la principale", () => {
    expect(shouldShowSecondaryImage("/a.svg", "/a.svg")).toBe(false);
    expect(shouldShowSecondaryImage("/b.svg", "/a.svg")).toBe(true);
  });
});

describe("canShowProductCardQuickAdd", () => {
  it("autorise l'ajout rapide avec une seule taille vendable", () => {
    const variants = deriveQuickAddVariants([variant()]);
    expect(
      canShowProductCardQuickAdd({
        quickAddVariants: variants,
        inStock: true,
        isStorefrontSellable: true,
      }),
    ).toBe(true);
  });

  it("refuse plusieurs tailles ou fiche non vendable", () => {
    const variants = deriveQuickAddVariants([
      variant({ id: "v1", sizeLabel: "3 ans" }),
      variant({ id: "v2", sizeLabel: "4 ans" }),
    ]);
    expect(
      canShowProductCardQuickAdd({
        quickAddVariants: variants,
        inStock: true,
        isStorefrontSellable: true,
      }),
    ).toBe(false);
    expect(
      canShowProductCardQuickAdd({
        quickAddVariants: deriveQuickAddVariants([variant()]),
        inStock: false,
        isStorefrontSellable: true,
      }),
    ).toBe(false);
  });
});
