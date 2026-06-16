import { describe, expect, it } from "vitest";

import {
  CATEGORY_TILOUKI_IMAGE,
  RITUAL_TILOUKI_IMAGE,
  getTiloukiImage,
  resolveBlogHeroTiloukiImage,
  resolveCategoryTiloukiImage,
  resolveRitualTiloukiImage,
  tiloukiImages,
} from "@/lib/tilouki-images";

describe("tilouki-images", () => {
  it("référence 52 images locales du pack avec alt du manifeste", () => {
    expect(Object.keys(tiloukiImages)).toHaveLength(52);
    for (const image of Object.values(tiloukiImages)) {
      expect(image.src).toMatch(/^\/images\/tilouki\/.+\.jpg$/);
      expect(image.alt.length).toBeGreaterThan(10);
      expect(image.sourceUrl).toMatch(/^https:\/\//);
      expect(image.licenseUrl).toBeTruthy();
      expect(image.credit).toBeTruthy();
    }
  });

  it("associe chaque catégorie principale à un visuel enfant cohérent", () => {
    expect(resolveCategoryTiloukiImage("garcon").key).toBe(
      CATEGORY_TILOUKI_IMAGE.garcon,
    );
    expect(resolveCategoryTiloukiImage("fille").key).toBe(
      CATEGORY_TILOUKI_IMAGE.fille,
    );
    expect(resolveCategoryTiloukiImage("bebe").key).toBe(CATEGORY_TILOUKI_IMAGE.bebe);
    expect(resolveCategoryTiloukiImage("pyjamas").key).toBe(
      CATEGORY_TILOUKI_IMAGE.pyjamas,
    );
    expect(resolveCategoryTiloukiImage("inconnue").key).toBe(
      "categorie-vetements-enfant-rack",
    );
  });

  it("associe chaque rituel à un moment visuel déterministe", () => {
    expect(resolveRitualTiloukiImage("nuit-calme").key).toBe(
      RITUAL_TILOUKI_IMAGE["nuit-calme"],
    );
    expect(resolveRitualTiloukiImage("jour-de-pluie").key).toBe(
      RITUAL_TILOUKI_IMAGE["jour-de-pluie"],
    );
    expect(getTiloukiImage("rituel-nuit-calme-enfant-dort").alt).toMatch(/dort|nuit/i);
    expect(getTiloukiImage("rituel-jour-de-pluie-flaque").alt).toMatch(/flaque|pluie/i);
  });

  it("résout les héros blog par sujet d'article", () => {
    expect(resolveBlogHeroTiloukiImage("pyjama-plie-lit-soir").key).toBe(
      "blog-bien-choisir-pyjama",
    );
    expect(resolveBlogHeroTiloukiImage("linge-enfant-etiquette-lavage").key).toBe(
      "guide-linge-bebe-propre",
    );
    expect(resolveBlogHeroTiloukiImage("id-inconnu").key).toBe(
      "blog-organisation-dressing",
    );
  });
});
