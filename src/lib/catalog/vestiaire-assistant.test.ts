import { describe, expect, it } from "vitest";

import {
  buildVestiaireCapsuleHref,
  DEFAULT_VESTIAIRE_SELECTION,
  estimateCapsuleTotalCents,
  pickVestiaireCapsule,
  productMatchesVestiaireAge,
} from "@/lib/catalog/vestiaire-assistant";
import { getRitualBySlug } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

const commercialUrl =
  "https://example.supabase.co/storage/v1/object/public/product-images/robe.jpg";

function product(
  overrides: Partial<ProductListItem> & Pick<ProductListItem, "slug" | "categorySlug">,
): ProductListItem {
  const { slug, categorySlug, ...rest } = overrides;
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: null,
    minPriceCents: 1990,
    compareAtPriceCents: null,
    primaryImageUrl: commercialUrl,
    primaryImageAlt: "Robe fille face avant, coton bleu",
    categorySlug,
    categoryName: categorySlug,
    season: null,
    material: null,
    sizes: ["4 ans"],
    ageLabels: ["4 ans"],
    totalStock: 5,
    badges: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    colorOptions: [],
    quickAddVariants: [],
    ...rest,
  };
}

describe("productMatchesVestiaireAge", () => {
  it("reconnaît les tranches d'âge", () => {
    expect(
      productMatchesVestiaireAge(
        product({ slug: "b1", categorySlug: "bebe", ageLabels: ["3 mois"] }),
        "bebe",
      ),
    ).toBe(true);
    expect(
      productMatchesVestiaireAge(
        product({ slug: "t1", categorySlug: "fille", ageLabels: ["2 ans"] }),
        "1-3-ans",
      ),
    ).toBe(true);
    expect(
      productMatchesVestiaireAge(
        product({ slug: "e1", categorySlug: "garcon", ageLabels: ["10 ans"] }),
        "8-12-ans",
      ),
    ).toBe(true);
  });
});

describe("pickVestiaireCapsule", () => {
  const pool = [
    product({
      slug: "pyjama-1",
      categorySlug: "pyjamas",
      name: "Pyjama étoiles",
      ageLabels: ["4 ans"],
      minPriceCents: 2490,
    }),
    product({
      slug: "pyjama-2",
      categorySlug: "pyjamas",
      name: "Pyjama combi",
      ageLabels: ["6 ans"],
      minPriceCents: 3190,
      badges: ["low-price"],
      compareAtPriceCents: 3990,
    }),
    product({
      slug: "pyjama-3",
      categorySlug: "pyjamas",
      name: "Pyjama fleurs",
      ageLabels: ["8 ans"],
      minPriceCents: 2790,
    }),
    product({
      slug: "robe-1",
      categorySlug: "fille",
      name: "Robe liberty",
      ageLabels: ["4 ans"],
    }),
  ];

  it("compose une capsule nuit douce pour 4-8 ans", () => {
    const result = pickVestiaireCapsule(pool, {
      moment: "nuit-douce",
      age: "4-8-ans",
      budget: "equilibre",
    });

    expect(result).not.toBeNull();
    expect(result!.products.length).toBeGreaterThanOrEqual(2);
    expect(result!.products.every((p) => p.categorySlug === "pyjamas")).toBe(true);
    expect(result!.totalCents).toBe(estimateCapsuleTotalCents(result!.products));
  });

  it("priorise les petits prix quand le budget le demande", () => {
    const result = pickVestiaireCapsule(pool, {
      moment: "nuit-douce",
      age: "4-8-ans",
      budget: "petit-prix",
    });

    expect(result!.products[0]?.slug).toBe("pyjama-1");
  });

  it("fournit des alternatives si la capsule est vide", () => {
    const result = pickVestiaireCapsule([], DEFAULT_VESTIAIRE_SELECTION);
    expect(result!.products).toHaveLength(0);
    expect(result!.alternatives.length).toBeGreaterThan(0);
  });
});

describe("buildVestiaireCapsuleHref", () => {
  it("pointe vers le rayon avec filtres âge", () => {
    const ritual = getRitualBySlug("nuit-calme")!;
    const href = buildVestiaireCapsuleHref(ritual, {
      moment: "nuit-douce",
      age: "4-8-ans",
      budget: "equilibre",
    });
    expect(href).toContain("/categorie/pyjamas");
    expect(href).toContain("ages=");
  });
});
