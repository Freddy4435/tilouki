import { describe, expect, it } from "vitest";

import {
  getAllRitualSlugs,
  getHomeRituals,
  getRitualBySlug,
  getRitualsForCatalogueLaunch,
  RITUALS,
} from "@/lib/rituals/rituals";

describe("rituals", () => {
  it("définit cinq sélections shopping avec objectif d'achat", () => {
    expect(RITUALS).toHaveLength(5);
    for (const ritual of RITUALS) {
      expect(ritual.slug).toMatch(/^[a-z0-9-]+$/);
      expect(ritual.title.length).toBeGreaterThan(3);
      expect(ritual.promise.length).toBeGreaterThan(20);
      expect(ritual.description.length).toBeGreaterThan(15);
      expect(ritual.imageId).toBeTruthy();
      expect(ritual.categorySlugs.length).toBeGreaterThan(0);
      expect(ritual.primaryCategorySlug.length).toBeGreaterThan(0);
      expect(ritual.ctaLabel.length).toBeGreaterThan(3);
      expect(ritual.shoppingTip.length).toBeGreaterThan(5);
      expect(ritual.emptyStateMessage.length).toBeGreaterThan(5);
      expect(ritual.emptyStateCtas.length).toBeGreaterThanOrEqual(2);
      expect(ritual.catalogueHref).toMatch(/^\//);
    }
  });

  it("résout les slugs", () => {
    expect(getAllRitualSlugs()).toHaveLength(5);
    expect(getRitualBySlug("petit-budget")?.title).toBe("Petits prix");
    expect(getRitualBySlug("bebe-cocon")?.title).toBe("Bébé cocon");
    expect(getRitualBySlug("inconnu")).toBeUndefined();
  });

  it("expose trois rituels pour le lancement catalogue", () => {
    const launch = getRitualsForCatalogueLaunch();
    expect(launch).toHaveLength(3);
    expect(launch.map((r) => r.slug)).toEqual([
      "matin-presse",
      "nuit-calme",
      "petit-budget",
    ]);
  });

  it("ordonne les modules shoppables de l'accueil", () => {
    expect(getHomeRituals().map((ritual) => ritual.title)).toEqual([
      "Nuit douce",
      "Jour de pluie",
      "Bébé cocon",
      "Matin école",
      "Petits prix",
    ]);
  });

  it("associe chaque rituel à une photo éditoriale cohérente", () => {
    expect(getRitualBySlug("matin-presse")?.imageId).toBe("ritual-morning");
    expect(getRitualBySlug("nuit-calme")?.imageId).toBe("ritual-night-calm");
    expect(getRitualBySlug("bebe-cocon")?.imageId).toBe("ritual-baby-cocoon");
    expect(getRitualBySlug("jour-de-pluie")?.imageId).toBe("ritual-rainy-day");
    expect(getRitualBySlug("petit-budget")?.imageId).toBe("colors-soft");
  });

  it("renvoie vers des rayons précis en état vide", () => {
    const nuit = getRitualBySlug("nuit-calme")!;
    expect(nuit.emptyStateCtas.some((cta) => cta.label.match(/pyjamas/i))).toBe(true);
    expect(nuit.catalogueHref).toContain("/categorie/pyjamas");

    const pluie = getRitualBySlug("jour-de-pluie")!;
    expect(pluie.primaryCategorySlug).toBe("pluie");
    expect(pluie.emptyStateCtas[0]?.label).toMatch(/pluie/i);

    const bebe = getRitualBySlug("bebe-cocon")!;
    expect(bebe.categorySlugs).toContain("bebe");
    expect(bebe.categorySlugs).toContain("bodies");
    expect(bebe.emptyStateCtas.some((cta) => cta.label.match(/bébé/i))).toBe(true);
  });
});
