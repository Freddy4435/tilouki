import { describe, expect, it } from "vitest";

import { buildStorefrontNavigation } from "@/lib/navigation/build-storefront-nav";
import { NAV_HREF } from "@/lib/navigation/nav-config";
import type { ShopCategory } from "@/lib/shop/types";
import type { ProductListItem } from "@/types/catalog";

const categories: ShopCategory[] = [
  { slug: "bebe", label: "Bébé", href: "/categorie/bebe" },
  { slug: "fille", label: "Fille", href: "/categorie/fille" },
  { slug: "garcon", label: "Garçon", href: "/categorie/garcon" },
  { slug: "pyjamas", label: "Pyjamas", href: "/categorie/pyjamas" },
  { slug: "accessoires", label: "Accessoires", href: "/categorie/accessoires" },
];

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
    primaryImageUrl: null,
    primaryImageAlt: null,
    categorySlug,
    categoryName: categorySlug,
    season: null,
    material: null,
    sizes: [],
    ageLabels: [],
    totalStock: 3,
    badges: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...rest,
  };
}

describe("buildStorefrontNavigation", () => {
  it("expose les entrées principales demandées", () => {
    const navigation = buildStorefrontNavigation(categories, [
      product({ slug: "robe-fille", categorySlug: "fille", sizes: ["6 ans"] }),
    ]);

    expect(navigation.topItems.map((item) => item.id)).toEqual([
      "nouveautes",
      "bebe",
      "fille",
      "garcon",
      "pyjamas",
      "petits-prix",
      "guide-tailles",
    ]);
  });

  it("construit des panneaux âge et besoin pour les univers", () => {
    const navigation = buildStorefrontNavigation(categories, [
      product({ slug: "body-bebe", categorySlug: "bebe", ageLabels: ["0-3 mois"] }),
    ]);

    const bebe = navigation.topItems.find(
      (item) => item.kind === "universe" && item.slug === "bebe",
    );
    expect(bebe?.kind).toBe("universe");
    if (bebe?.kind !== "universe") return;

    const agePanel = bebe.panels.find((panel) => panel.title === "Par âge");
    expect(agePanel?.links.some((link) => link.label === "0-3 mois")).toBe(true);
    expect(agePanel?.links[0]?.href).toContain("ages=0-3+mois");

    const needPanel = bebe.panels.find((panel) => panel.title === "Par besoin");
    expect(needPanel?.links.map((link) => link.label)).toEqual([
      "Bodies",
      "Pyjamas",
      "Pulls & sweats",
      "Pantalons",
      "Accessoires",
    ]);
  });

  it("structure le menu mobile avec parcourir et réassurance", () => {
    const navigation = buildStorefrontNavigation(categories, []);

    expect(navigation.mobileSections.map((section) => section.id)).toEqual([
      "parcourir",
      "reassurance",
    ]);

    const parcourir = navigation.mobileSections[0]?.links ?? [];
    expect(parcourir.some((link) => link.href === NAV_HREF.nouveautes)).toBe(true);
    expect(parcourir.some((link) => link.label === "Guide tailles")).toBe(true);

    const reassurance = navigation.mobileSections[1]?.links ?? [];
    expect(reassurance.some((link) => link.href === NAV_HREF.favoris)).toBe(true);
    expect(reassurance.some((link) => link.href === "__contact__")).toBe(true);
  });
});
