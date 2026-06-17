import { describe, expect, it } from "vitest";

import { pickProductsForRitual } from "@/lib/rituals/pick-ritual-products";
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
    totalStock: 2,
    badges: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...rest,
  };
}

describe("pickProductsForRitual", () => {
  it("filtre par catégorie du rituel", () => {
    const ritual = getRitualBySlug("nuit-calme")!;
    const picked = pickProductsForRitual(
      [
        product({ slug: "pyjama-1", categorySlug: "pyjamas" }),
        product({ slug: "robe-1", categorySlug: "fille" }),
      ],
      ritual,
    );
    expect(picked.map((p) => p.slug)).toEqual(["pyjama-1"]);
  });

  it("utilise les petits prix pour le rituel budget", () => {
    const ritual = getRitualBySlug("petit-budget")!;
    const picked = pickProductsForRitual(
      [
        product({ slug: "cher", categorySlug: "fille", minPriceCents: 8900 }),
        product({ slug: "doux", categorySlug: "fille", minPriceCents: 990 }),
      ],
      ritual,
    );
    expect(picked[0]?.slug).toBe("doux");
  });

  it("ignore les fiches sans photo commerciale", () => {
    const ritual = getRitualBySlug("matin-presse")!;
    const picked = pickProductsForRitual(
      [product({ slug: "sans-photo", categorySlug: "garcon", primaryImageUrl: null })],
      ritual,
    );
    expect(picked).toHaveLength(0);
  });

  it("priorise le rayon pluie pour jour de pluie", () => {
    const ritual = getRitualBySlug("jour-de-pluie")!;
    const picked = pickProductsForRitual(
      [
        product({ slug: "robe-fille", categorySlug: "fille", name: "Robe fille" }),
        product({
          slug: "veste-pluie",
          categorySlug: "pluie",
          name: "Veste imperméable pluie",
        }),
      ],
      ritual,
    );
    expect(picked[0]?.categorySlug).toBe("pluie");
  });

  it("sélectionne bébé et bodies pour bébé cocon", () => {
    const ritual = getRitualBySlug("bebe-cocon")!;
    const picked = pickProductsForRitual(
      [
        product({ slug: "robe-fille", categorySlug: "fille", name: "Robe" }),
        product({ slug: "body-bebe", categorySlug: "bodies", name: "Body coton bébé" }),
        product({ slug: "pyjama-bebe", categorySlug: "pyjamas", name: "Pyjama bébé" }),
      ],
      ritual,
    );
    expect(picked.map((p) => p.categorySlug)).toEqual(
      expect.arrayContaining(["bodies", "pyjamas"]),
    );
    expect(picked.some((p) => p.categorySlug === "fille")).toBe(false);
  });

  it("classe les pyjamas pour nuit douce", () => {
    const ritual = getRitualBySlug("nuit-calme")!;
    const picked = pickProductsForRitual(
      [
        product({ slug: "jogger", categorySlug: "garcon", name: "Jogger garçon" }),
        product({
          slug: "pyjama-nuit-doux",
          categorySlug: "pyjamas",
          name: "Pyjama étoiles",
        }),
      ],
      ritual,
    );
    expect(picked[0]?.slug).toBe("pyjama-nuit-doux");
  });
});
