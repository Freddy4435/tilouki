import { describe, expect, it } from "vitest";

import { buildStorefrontNavigation } from "@/lib/navigation/build-storefront-nav";
import { NAV_HREF } from "@/lib/navigation/nav-config";
import { buyingGuidesNav } from "@/lib/constants/site";
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
  it("expose les entrées principales avec mega-menus catégories", () => {
    const navigation = buildStorefrontNavigation(categories, [
      product({ slug: "robe-fille", categorySlug: "fille", sizes: ["6 ans"] }),
      product({
        slug: "promo-bebe",
        categorySlug: "bebe",
        badges: ["low-price"],
        compareAtPriceCents: 2990,
        minPriceCents: 1490,
      }),
    ]);

    expect(navigation.topItems.map((item) => item.id)).toEqual([
      "nouveautes",
      "bebe",
      "fille",
      "garcon",
      "pyjamas",
      "accessoires",
      "petits-prix",
      "guide-tailles",
    ]);
  });

  it("masque Petits prix si aucune offre en catalogue", () => {
    const navigation = buildStorefrontNavigation(categories, [
      product({ slug: "body-bebe", categorySlug: "bebe" }),
    ]);

    expect(navigation.topItems.some((item) => item.id === "petits-prix")).toBe(false);
    expect(navigation.hasLowPriceProducts).toBe(false);
  });

  it("construit des panneaux retail pour les univers", () => {
    const navigation = buildStorefrontNavigation(categories, [
      product({
        slug: "body-bebe",
        categorySlug: "bebe",
        ageLabels: ["0-3 mois"],
        badges: ["low-price"],
        totalStock: 1,
      }),
    ]);

    const bebe = navigation.topItems.find(
      (item) => item.kind === "universe" && item.slug === "bebe",
    );
    expect(bebe?.kind).toBe("universe");
    if (bebe?.kind !== "universe") return;

    expect(bebe.panels.map((panel) => panel.title)).toEqual([
      "En ce moment",
      "Rayons",
      "Par âge",
      "Sélections",
      "Bonnes affaires",
    ]);

    const agePanel = bebe.panels.find((panel) => panel.title === "Par âge");
    expect(agePanel?.links.some((link) => link.label === "0-3 mois")).toBe(true);
    expect(agePanel?.links[0]?.href).toContain("ages=0-3+mois");

    const rayonsPanel = bebe.panels.find((panel) => panel.title === "Rayons");
    expect(rayonsPanel?.links.map((link) => link.label)).toEqual([
      "Bodies",
      "Pyjamas bébé",
      "Gigoteuses",
      "Ensembles",
    ]);

    const selectionsPanel = bebe.panels.find((panel) => panel.title === "Sélections");
    expect(
      selectionsPanel?.links.some((link) => link.href === "/rituels/bebe-cocon"),
    ).toBe(true);

    const dealsPanel = bebe.panels.find((panel) => panel.title === "Bonnes affaires");
    expect(dealsPanel?.links.map((link) => link.label)).toEqual([
      "Petits prix",
      "Dernières pièces",
    ]);
    expect(dealsPanel?.links[0]?.href).toContain("promo=petit-prix");

    expect(bebe.featured?.href).toContain("categorie=bebe");
    expect(bebe.featured?.imageKind).toBe("category");
  });

  it("ajoute un mega-menu Pyjamas et Accessoires", () => {
    const navigation = buildStorefrontNavigation(categories, []);

    const pyjamas = navigation.topItems.find((item) => item.id === "pyjamas");
    expect(pyjamas?.kind).toBe("category");
    if (pyjamas?.kind !== "category") return;

    expect(pyjamas.panels.some((panel) => panel.title === "Sélections")).toBe(true);
    expect(
      pyjamas.panels
        .find((panel) => panel.title === "Sélections")
        ?.links.some((link) => link.href === "/rituels/nuit-calme"),
    ).toBe(true);

    const accessoires = navigation.topItems.find((item) => item.id === "accessoires");
    expect(accessoires?.kind).toBe("category");
  });

  it("structure le menu mobile sans sous-menus profonds", () => {
    const navigation = buildStorefrontNavigation(categories, [
      product({
        slug: "promo",
        categorySlug: "fille",
        badges: ["low-price"],
        compareAtPriceCents: 2500,
        minPriceCents: 1200,
      }),
    ]);

    expect(navigation.mobileSections.map((section) => section.id)).toEqual([
      "parcourir",
      "selections",
      "reassurance",
    ]);

    const parcourir = navigation.mobileSections[0]?.links ?? [];
    expect(parcourir.some((link) => link.href === NAV_HREF.nouveautes)).toBe(true);
    expect(parcourir.some((link) => link.label === "Pyjamas")).toBe(true);
    expect(parcourir.some((link) => link.label === "Accessoires")).toBe(true);
    expect(parcourir.some((link) => link.label === "Guide tailles")).toBe(true);

    const selections = navigation.mobileSections[1]?.links ?? [];
    expect(selections.some((link) => link.href === "/rituels/nuit-calme")).toBe(true);

    const reassurance = navigation.mobileSections[2]?.links ?? [];
    expect(reassurance.some((link) => link.href === NAV_HREF.favoris)).toBe(true);
    expect(reassurance.some((link) => link.href === "__contact__")).toBe(true);
    expect(reassurance.some((link) => link.label === buyingGuidesNav.label)).toBe(true);
    expect(navigation.topItems.some((item) => item.href === NAV_HREF.blog)).toBe(false);
  });
});
