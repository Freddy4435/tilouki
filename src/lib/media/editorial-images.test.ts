import { describe, expect, it } from "vitest";

import {
  editorialImages,
  getDefaultHeroEditorialImage,
  getEditorialImage,
  resolveBlogHeroImage,
  resolveUniverseEditorialImage,
} from "@/lib/media/editorial-images";

describe("editorial-images", () => {
  it("référence 21 modules éditoriaux branchés sur le pack Tilouki", () => {
    expect(Object.keys(editorialImages)).toHaveLength(21);
    for (const image of Object.values(editorialImages)) {
      expect(image.src).toMatch(/^\/images\/tilouki\/.+\.jpg$/);
      expect(image.sourceUrl).toMatch(/^https:\/\//);
      expect(image.licenseUrl).toBeTruthy();
      expect(image.credit).toBeTruthy();
      expect(image.alt.length).toBeGreaterThan(10);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
  });

  it("utilise le hero pack par défaut", () => {
    const hero = getDefaultHeroEditorialImage();
    expect(hero.id).toBe("hero-home");
    expect(hero.src).toBe(
      "/images/tilouki/03-home-et-marque/home-hero-dressing-couleurs.jpg",
    );
  });

  it("résout les visuels blog avec repli déterministe", () => {
    const mapped = resolveBlogHeroImage("pyjama-plie-lit-soir");
    expect(mapped.src).toBe(
      "/images/tilouki/04-blog/blog-bien-choisir-pyjama.jpg",
    );
    expect(getEditorialImage("pajamas-evening").src).toMatch(/blog-rituel-du-soir/);

    const fallback = resolveBlogHeroImage("id-inconnu");
    expect(fallback.src).toBe(
      "/images/tilouki/04-blog/blog-organisation-dressing.jpg",
    );
  });

  it("associe chaque univers catalogue à une photo sémantique du pack", () => {
    expect(resolveUniverseEditorialImage("garcon").src).toMatch(
      /categorie-garcon-look-moderne/,
    );
    expect(resolveUniverseEditorialImage("fille").src).toMatch(/categorie-fille-look-doux/);
    expect(resolveUniverseEditorialImage("bebe").src).toMatch(
      /categorie-bebe-combinaison-grise/,
    );
    expect(resolveUniverseEditorialImage("pyjamas").src).toMatch(
      /categorie-pyjama-fille-doudou/,
    );
    expect(resolveUniverseEditorialImage("accessoires").src).toMatch(
      /categorie-accessoires-bebe-chaussettes/,
    );
  });
});
