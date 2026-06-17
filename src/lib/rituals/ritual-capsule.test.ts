import { describe, expect, it } from "vitest";

import {
  estimateRitualCapsuleTotalCents,
  getRitualCapsuleHref,
  shouldShowRitualCapsuleTotal,
  buildNearbyCapsuleAlternatives,
  buildRitualEmptyAlternatives,
} from "@/lib/rituals/ritual-capsule";
import { getRitualBySlug } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

const commercialUrl =
  "https://example.supabase.co/storage/v1/object/public/product-images/robe.jpg";

function product(price: number): ProductListItem {
  return {
    id: `p-${price}`,
    slug: `p-${price}`,
    name: "Produit",
    shortDescription: null,
    minPriceCents: price,
    compareAtPriceCents: null,
    primaryImageUrl: commercialUrl,
    primaryImageAlt: "Robe fille face avant, coton bleu",
    categorySlug: "fille",
    categoryName: "Fille",
    season: null,
    material: null,
    sizes: ["4 ans"],
    ageLabels: ["4 ans"],
    totalStock: 2,
    badges: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    colorOptions: [],
    quickAddVariants: [],
  };
}

describe("ritual-capsule", () => {
  it("calcule le total à partir de 2 produits minimum", () => {
    expect(shouldShowRitualCapsuleTotal([product(1200)])).toBe(false);
    expect(shouldShowRitualCapsuleTotal([product(1200), product(1500)])).toBe(true);
    expect(estimateRitualCapsuleTotalCents([product(1200), product(1500)])).toBe(2700);
  });

  it("pointe vers la page capsule", () => {
    expect(getRitualCapsuleHref("nuit-calme")).toBe("/rituels/nuit-calme");
  });

  it("propose des alternatives sans blog", () => {
    const ritual = getRitualBySlug("nuit-calme")!;
    const alternatives = buildRitualEmptyAlternatives(ritual);
    expect(alternatives.some((cta) => cta.label.match(/nouveautés/i))).toBe(true);
    expect(alternatives.every((cta) => !cta.href.startsWith("/blog"))).toBe(true);
  });

  it("propose des capsules proches réelles", () => {
    const ritual = getRitualBySlug("nuit-calme")!;
    const nearby = buildNearbyCapsuleAlternatives(ritual);
    expect(nearby.length).toBeGreaterThan(0);
    expect(nearby.every((cta) => cta.href.startsWith("/rituels/"))).toBe(true);
    expect(nearby.some((cta) => cta.href === "/rituels/nuit-calme")).toBe(false);
  });
});
