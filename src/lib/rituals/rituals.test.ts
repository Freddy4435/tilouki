import { describe, expect, it } from "vitest";

import {
  getAllRitualSlugs,
  getRitualBySlug,
  getRitualsForCatalogueLaunch,
  RITUALS,
} from "@/lib/rituals/rituals";

describe("rituals", () => {
  it("définit cinq rituels avec contenu éditorial", () => {
    expect(RITUALS).toHaveLength(5);
    for (const ritual of RITUALS) {
      expect(ritual.slug).toMatch(/^[a-z0-9-]+$/);
      expect(ritual.title.length).toBeGreaterThan(3);
      expect(ritual.description.length).toBeGreaterThan(20);
      expect(ritual.imageId).toBeTruthy();
      expect(ritual.categorySlugs.length).toBeGreaterThan(0);
      expect(ritual.blogSlugs.length).toBeGreaterThan(0);
      expect(ritual.emptyStateTips.length).toBeGreaterThanOrEqual(3);
      expect(ritual.catalogueHref).toMatch(/^\//);
    }
  });

  it("résout les slugs", () => {
    expect(getAllRitualSlugs()).toHaveLength(5);
    expect(getRitualBySlug("petit-budget")?.title).toBe("Petit budget");
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

  it("associe chaque rituel à une photo éditoriale cohérente", () => {
    expect(getRitualBySlug("matin-presse")?.imageId).toBe("ritual-morning");
    expect(getRitualBySlug("nuit-calme")?.imageId).toBe("ritual-night-calm");
    expect(getRitualBySlug("sortie-famille")?.imageId).toBe("ritual-family-outing");
    expect(getRitualBySlug("jour-de-pluie")?.imageId).toBe("ritual-rainy-day");
    expect(getRitualBySlug("petit-budget")?.imageId).toBe("colors-soft");
  });
});
