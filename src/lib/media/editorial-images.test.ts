import { describe, expect, it } from "vitest";

import {
  editorialImages,
  getDefaultHeroEditorialImage,
  getEditorialImage,
  resolveBlogHeroImage,
  resolveUniverseEditorialImage,
} from "@/lib/media/editorial-images";

describe("editorial-images", () => {
  it("référence 21 images locales avec crédits", () => {
    expect(Object.keys(editorialImages)).toHaveLength(21);
    for (const image of Object.values(editorialImages)) {
      expect(image.src).toMatch(/^\/editorial\/[\w-]+\.webp$/);
      expect(image.sourceUrl).toMatch(/^https:\/\//);
      expect(image.licenseUrl).toBeTruthy();
      expect(image.credit).toBeTruthy();
      expect(image.alt.length).toBeGreaterThan(10);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
  });

  it("utilise le hero éditorial par défaut", () => {
    expect(getDefaultHeroEditorialImage().id).toBe("hero-home");
  });

  it("résout les visuels blog avec repli blog-default", () => {
    const mapped = resolveBlogHeroImage("pyjama-plie-lit-soir");
    expect(mapped.id).toBe("pajamas-evening");
    expect(getEditorialImage(mapped.id).src).toBe(mapped.src);

    const fallback = resolveBlogHeroImage("id-inconnu");
    expect(fallback.id).toBe("blog-default");
  });

  it("associe chaque univers catalogue à une photo sémantique", () => {
    expect(resolveUniverseEditorialImage("garcon")?.id).toBe("universe-garcon");
    expect(resolveUniverseEditorialImage("fille")?.id).toBe("universe-fille");
    expect(resolveUniverseEditorialImage("bebe")?.id).toBe("universe-bebe");
    expect(resolveUniverseEditorialImage("pyjamas")?.id).toBe("universe-pyjamas");
    expect(resolveUniverseEditorialImage("accessoires")?.id).toBe("universe-accessoires");
  });
});
