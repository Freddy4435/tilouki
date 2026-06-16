import { describe, expect, it } from "vitest";

import { blogArticles } from "@/content/blog/articles";
import { HOME_RAYONS } from "@/lib/catalog/home-sections";
import { getAllRitualSlugs } from "@/lib/rituals/rituals";
import {
  BLOG_HERO_IMAGE_REGISTRY,
  CATEGORY_IMAGE_REGISTRY,
  HOME_EDITORIAL_MODULE_REGISTRY,
  KNOWN_TILOUKI_IMAGE_MODULES,
  QUICK_ACCESS_IMAGE_REGISTRY,
  RITUAL_IMAGE_REGISTRY,
  isRegisteredTiloukiImageKey,
} from "@/lib/tilouki-image-registry";
import {
  assertNotTiloukiPackProductImage,
  getTiloukiImage,
  resolveCategoryTiloukiImage,
  resolveEditorialModuleTiloukiImage,
  resolveQuickAccessTiloukiImage,
  resolveRitualTiloukiImage,
  tiloukiImages,
} from "@/lib/tilouki-images";

describe("tilouki-image-registry", () => {
  it("référence uniquement des clés présentes dans le manifeste", () => {
    for (const entry of Object.values(KNOWN_TILOUKI_IMAGE_MODULES)) {
      expect(isRegisteredTiloukiImageKey(entry.key)).toBe(true);
      expect(getTiloukiImage(entry.key).src).toMatch(/^\/images\/tilouki\//);
    }
  });

  it("couvre tous les modules connus sans trou dans la registry", () => {
    const ritualSlugs = getAllRitualSlugs();
    for (const slug of ritualSlugs) {
      expect(RITUAL_IMAGE_REGISTRY[slug as keyof typeof RITUAL_IMAGE_REGISTRY]).toBeDefined();
    }

    const blogHeroIds = [...new Set(blogArticles.map((article) => article.heroImageId))];
    for (const heroImageId of blogHeroIds) {
      expect(
        BLOG_HERO_IMAGE_REGISTRY[heroImageId as keyof typeof BLOG_HERO_IMAGE_REGISTRY],
      ).toBeDefined();
    }

    for (const rayon of HOME_RAYONS) {
      if ("imageModuleId" in rayon) {
        expect(
          HOME_EDITORIAL_MODULE_REGISTRY[
            rayon.imageModuleId as keyof typeof HOME_EDITORIAL_MODULE_REGISTRY
          ],
        ).toBeDefined();
      } else {
        expect(
          QUICK_ACCESS_IMAGE_REGISTRY[
            rayon.imageSlug as keyof typeof QUICK_ACCESS_IMAGE_REGISTRY
          ],
        ).toBeDefined();
      }
    }

    for (const id of Object.keys(HOME_EDITORIAL_MODULE_REGISTRY)) {
      expect(KNOWN_TILOUKI_IMAGE_MODULES[id]).toBeDefined();
    }
  });

  it("assigne des visuels sémantiquement cohérents aux univers et rituels", () => {
    const garcon = getTiloukiImage(CATEGORY_IMAGE_REGISTRY.garcon);
    expect(garcon.key).toMatch(/garcon/);
    expect(garcon.alt).toMatch(/gar[cç]on/i);

    const bebe = getTiloukiImage(CATEGORY_IMAGE_REGISTRY.bebe);
    expect(bebe.alt).toMatch(/b[eé]b[eé]/i);

    const nuit = getTiloukiImage(RITUAL_IMAGE_REGISTRY["nuit-calme"]);
    expect(nuit.key).toMatch(/nuit|pyjama|lit|dort/i);
    expect(nuit.alt).toMatch(/dort|nuit|pyjama|sommeil|lit/i);

    const pluie = getTiloukiImage(RITUAL_IMAGE_REGISTRY["jour-de-pluie"]);
    expect(pluie.key).toMatch(/pluie|flaque|botte/i);
    expect(pluie.alt).toMatch(/pluie|flaque|botte/i);
  });

  it("résout les modules connus via leur entrée dédiée (pas un fallback générique)", () => {
    expect(resolveCategoryTiloukiImage("garcon").key).toBe(CATEGORY_IMAGE_REGISTRY.garcon);
    expect(resolveCategoryTiloukiImage("fille").key).toBe(CATEGORY_IMAGE_REGISTRY.fille);
    expect(resolveCategoryTiloukiImage("bebe").key).toBe(CATEGORY_IMAGE_REGISTRY.bebe);
    expect(resolveRitualTiloukiImage("nuit-calme").key).toBe(
      RITUAL_IMAGE_REGISTRY["nuit-calme"],
    );
    expect(resolveRitualTiloukiImage("jour-de-pluie").key).toBe(
      RITUAL_IMAGE_REGISTRY["jour-de-pluie"],
    );
    expect(resolveEditorialModuleTiloukiImage("hero-home").key).toBe(
      HOME_EDITORIAL_MODULE_REGISTRY["hero-home"],
    );
    expect(resolveQuickAccessTiloukiImage("pyjamas").key).toBe(
      QUICK_ACCESS_IMAGE_REGISTRY.pyjamas,
    );
  });

  it("utilise un repli enfant cohérent pour une catégorie inconnue", () => {
    const unknown = resolveCategoryTiloukiImage("inconnue");
    expect(unknown.key).toBe("categorie-boutique-enfants-mannequins");
    expect(unknown.alt).toMatch(/enfant|boutique|mannequin|vêtement/i);
  });
});

describe("interdiction pack Tilouki en photo produit", () => {
  it("rejette une URL pack Tilouki", () => {
    const sample = Object.values(tiloukiImages)[0]!.src;
    expect(() => assertNotTiloukiPackProductImage(sample, "import produit")).toThrow(
      /interdit comme photo produit vendable/i,
    );
  });

  it("accepte une URL produit commerciale", () => {
    expect(() =>
      assertNotTiloukiPackProductImage("/products/robe-demo.jpg", "fiche produit"),
    ).not.toThrow();
  });
});
