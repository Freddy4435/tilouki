import manifest from "@/data/manifest-photos-tilouki.json";

/** Surfaces éditoriales autorisées — jamais en fiche produit vendable. */
export const TILOUKI_IMAGE_SURFACES = [
  "home-hero",
  "home-module",
  "quick-access",
  "category",
  "ritual",
  "catalogue",
  "blog",
  "reassurance",
] as const;

export type TiloukiImageSurface = (typeof TILOUKI_IMAGE_SURFACES)[number];

export type TiloukiImageKey = (typeof manifest)[number]["file"];

/** Hero accueil — dressing enfant coloré. */
export const HOME_HERO_IMAGE_KEY = "home-hero-dressing-couleurs" as const satisfies TiloukiImageKey;

/** Modules home / éditoriaux (id logique → clé pack). */
export const HOME_EDITORIAL_MODULE_REGISTRY = {
  "hero-home": HOME_HERO_IMAGE_KEY,
  "baby-clothes-flatlay": "categorie-bebe-body-neutre",
  "nursery-wardrobe": "home-boutique-cocooning",
  "cotton-texture": "blog-matieres-douces-pull-jean",
  "pajamas-evening": "blog-rituel-du-soir",
  "size-guide": "guide-tailles-tenues-enfants",
  "laundry-care": "guide-linge-bebe-propre",
  "weekend-bag": "blog-preparer-valise-enfant",
  "colors-soft": "home-fratrie-complice",
  "blog-default": "blog-organisation-dressing",
  newsletter: "home-bebe-sourire-cocon",
  "material-closeup": "detail-tee-shirt-bebe-flatlay",
  "universe-garcon": "categorie-garcon-look-moderne",
  "universe-fille": "categorie-fille-look-doux",
  "universe-bebe": "categorie-bebe-combinaison-grise",
  "universe-pyjamas": "categorie-pyjama-fille-doudou",
  "universe-accessoires": "categorie-accessoires-bebe-chaussettes",
  "ritual-morning": "rituel-matin-dressing-bebe",
  "ritual-night-calm": "rituel-nuit-calme-enfant-dort",
  "ritual-family-outing": "rituel-promenade-bulles",
  "ritual-baby-cocoon": "rituel-bebe-panier-cocon",
  "ritual-rainy-day": "rituel-jour-de-pluie-flaque",
  "lecture-soir": "rituel-lecture-au-lit-pyjama",
  "cocooning-bebe": "rituel-bebe-panier-cocon",
  "home-petits-prix": "categorie-vetements-enfant-rack",
} as const satisfies Record<string, TiloukiImageKey>;

export type HomeEditorialModuleId = keyof typeof HOME_EDITORIAL_MODULE_REGISTRY;

/** Accès rapides accueil / rayons. */
export const QUICK_ACCESS_IMAGE_REGISTRY = {
  bebe: "categorie-bebe-combinaison-grise",
  fille: "categorie-fille-look-doux",
  garcon: "categorie-garcon-look-moderne",
  pyjamas: "categorie-pyjama-fille-doudou",
  "petits-prix": "categorie-vetements-enfant-rack",
} as const satisfies Record<string, TiloukiImageKey>;

export type QuickAccessModuleId = keyof typeof QUICK_ACCESS_IMAGE_REGISTRY;

/** Catégories catalogue → visuel enfant cohérent. */
export const CATEGORY_IMAGE_REGISTRY = {
  garcon: "categorie-garcon-look-moderne",
  fille: "categorie-fille-look-doux",
  bebe: "categorie-bebe-combinaison-grise",
  pyjamas: "categorie-pyjama-fille-doudou",
  pluie: "categorie-pluie-garcon-bottes",
  accessoires: "categorie-accessoires-bebe-chaussettes",
  robes: "categorie-robes-fille-couleurs",
  bodies: "categorie-bebe-body-neutre",
  ceremonie: "categorie-ceremonie-fille-robe",
  nouveautes: "categorie-boutique-enfants-mannequins",
  ensembles: "categorie-tenues-fratrie-ete",
} as const satisfies Record<string, TiloukiImageKey>;

export type CategorySlug = keyof typeof CATEGORY_IMAGE_REGISTRY;

/** Rituels shopping (slug) → moment visuel. */
export const RITUAL_IMAGE_REGISTRY = {
  "matin-presse": "rituel-matin-dressing-bebe",
  "nuit-calme": "rituel-nuit-calme-enfant-dort",
  "bebe-cocon": "rituel-bebe-panier-cocon",
  "jour-de-pluie": "rituel-jour-de-pluie-flaque",
  "petit-budget": "categorie-vetements-enfant-rack",
} as const satisfies Record<string, TiloukiImageKey>;

export type RitualSlug = keyof typeof RITUAL_IMAGE_REGISTRY;

/** Héros articles blog (heroImageId). */
export const BLOG_HERO_IMAGE_REGISTRY = {
  "parent-mesure-body-table": "guide-tailles-tenues-enfants",
  "gros-plan-matieres-naturelles": "blog-matieres-douces-pull-jean",
  "body-bonnet-pyjama-lit": "categorie-bebe-body-neutre",
  "pyjama-plie-lit-soir": "blog-bien-choisir-pyjama",
  "trois-pieces-tenue-enfant": "blog-look-garcon-quotidien",
  "linge-enfant-etiquette-lavage": "guide-linge-bebe-propre",
  "detail-couture-tissu": "detail-body-rose-ourson",
  "valise-week-end-enfant": "blog-preparer-valise-enfant",
  "palette-couleurs-douces": "categorie-robes-fille-couleurs",
  "pile-vetements-petits-prix": "categorie-vetements-enfant-rack",
} as const satisfies Record<string, TiloukiImageKey>;

export type BlogHeroImageId = keyof typeof BLOG_HERO_IMAGE_REGISTRY;

/** Bandeaux catalogue / lancement. */
export const CATALOGUE_SURFACE_IMAGE_REGISTRY = {
  "catalogue-index": "categorie-boutique-enfants-mannequins",
  "catalogue-category-banner": "categorie-boutique-enfants-mannequins",
} as const satisfies Record<string, TiloukiImageKey>;

/** Guides, newsletter, pages confiance. */
export const REASSURANCE_SURFACE_IMAGE_REGISTRY = {
  "guide-tailles-page": "guide-tailles-tenues-enfants",
  "guide-linge": "guide-linge-bebe-propre",
  newsletter: "home-bebe-sourire-cocon",
  "livraison-retours": "home-bottes-pluie-parc",
} as const satisfies Record<string, TiloukiImageKey>;

/** Modules connus — toute entrée doit avoir une image dédiée dans une registry. */
export const KNOWN_TILOUKI_IMAGE_MODULES: Record<
  string,
  { surface: TiloukiImageSurface; key: TiloukiImageKey }
> = {
  "home-hero": { surface: "home-hero", key: HOME_HERO_IMAGE_KEY },
  ...Object.fromEntries(
    Object.entries(HOME_EDITORIAL_MODULE_REGISTRY).map(([id, key]) => [
      id,
      { surface: "home-module" as const, key },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(QUICK_ACCESS_IMAGE_REGISTRY).map(([id, key]) => [
      `quick-access:${id}`,
      { surface: "quick-access" as const, key },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CATEGORY_IMAGE_REGISTRY).map(([id, key]) => [
      `category:${id}`,
      { surface: "category" as const, key },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(RITUAL_IMAGE_REGISTRY).map(([id, key]) => [
      `ritual:${id}`,
      { surface: "ritual" as const, key },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(BLOG_HERO_IMAGE_REGISTRY).map(([id, key]) => [
      `blog:${id}`,
      { surface: "blog" as const, key },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CATALOGUE_SURFACE_IMAGE_REGISTRY).map(([id, key]) => [
      `catalogue:${id}`,
      { surface: "catalogue" as const, key },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(REASSURANCE_SURFACE_IMAGE_REGISTRY).map(([id, key]) => [
      `reassurance:${id}`,
      { surface: "reassurance" as const, key },
    ]),
  ),
};

/** Fallbacks par famille — plus précis que l'ancien rack générique. */
export const TILOUKI_FAMILY_FALLBACK_KEYS = {
  category: "categorie-boutique-enfants-mannequins",
  ritual: "rituel-bebe-panier-cocon",
  home: HOME_HERO_IMAGE_KEY,
  blog: "blog-organisation-dressing",
  detail: "detail-body-rose-ourson",
  guide: "guide-tailles-tenues-enfants",
} as const satisfies Record<string, TiloukiImageKey>;

const MANIFEST_KEYS = new Set(manifest.map((entry) => entry.file));

export function isRegisteredTiloukiImageKey(key: string): key is TiloukiImageKey {
  return MANIFEST_KEYS.has(key);
}

/** Repli catégorie inconnu — reste dans l'univers enfant, jamais hors sujet. */
export function resolveCategoryFallbackKey(categorySlug: string): TiloukiImageKey {
  const normalized = categorySlug.toLowerCase();

  if (normalized.includes("bebe") || normalized.includes("body") || normalized.includes("naissance")) {
    return CATEGORY_IMAGE_REGISTRY.bebe;
  }
  if (normalized.includes("fille") || normalized.includes("robe")) {
    return CATEGORY_IMAGE_REGISTRY.fille;
  }
  if (normalized.includes("garcon") || normalized.includes("garçon")) {
    return CATEGORY_IMAGE_REGISTRY.garcon;
  }
  if (normalized.includes("pyjama") || normalized.includes("nuit")) {
    return CATEGORY_IMAGE_REGISTRY.pyjamas;
  }
  if (normalized.includes("pluie") || normalized.includes("imper")) {
    return CATEGORY_IMAGE_REGISTRY.pluie;
  }
  if (normalized.includes("accessoire") || normalized.includes("chaussette")) {
    return CATEGORY_IMAGE_REGISTRY.accessoires;
  }

  return TILOUKI_FAMILY_FALLBACK_KEYS.category;
}

/** Repli rituel inconnu — thème nuit, pluie, bébé ou matin selon le slug. */
export function resolveRitualFallbackKey(ritualSlug: string): TiloukiImageKey {
  const normalized = ritualSlug.toLowerCase();

  if (normalized.includes("nuit") || normalized.includes("pyjama") || normalized.includes("dodo")) {
    return RITUAL_IMAGE_REGISTRY["nuit-calme"];
  }
  if (normalized.includes("pluie")) {
    return RITUAL_IMAGE_REGISTRY["jour-de-pluie"];
  }
  if (normalized.includes("bebe") || normalized.includes("bébé") || normalized.includes("cocon")) {
    return RITUAL_IMAGE_REGISTRY["bebe-cocon"];
  }
  if (normalized.includes("matin") || normalized.includes("ecole") || normalized.includes("école")) {
    return RITUAL_IMAGE_REGISTRY["matin-presse"];
  }
  if (normalized.includes("budget") || normalized.includes("prix")) {
    return RITUAL_IMAGE_REGISTRY["petit-budget"];
  }

  return TILOUKI_FAMILY_FALLBACK_KEYS.ritual;
}

/** Repli module éditorial inconnu — dérivé du préfixe sémantique. */
export function resolveEditorialModuleFallbackKey(moduleId: string): TiloukiImageKey {
  if (moduleId.startsWith("universe-")) {
    const slug = moduleId.slice("universe-".length);
    return (
      CATEGORY_IMAGE_REGISTRY[slug as CategorySlug] ?? resolveCategoryFallbackKey(slug)
    );
  }
  if (moduleId.startsWith("ritual-")) {
    return TILOUKI_FAMILY_FALLBACK_KEYS.ritual;
  }
  if (moduleId.includes("pyjama") || moduleId.includes("nuit")) {
    return HOME_EDITORIAL_MODULE_REGISTRY["pajamas-evening"];
  }
  if (moduleId.includes("bebe") || moduleId.includes("baby")) {
    return HOME_EDITORIAL_MODULE_REGISTRY["baby-clothes-flatlay"];
  }

  return TILOUKI_FAMILY_FALLBACK_KEYS.home;
}
