import manifest from "@/data/manifest-photos-tilouki.json";

/** Racine publique du pack photos Tilouki 2026. */
export const TILOUKI_IMAGE_BASE = "/images/tilouki" as const;

/** Clé fichier sans extension — correspond au champ `file` du manifeste. */
export type TiloukiImageKey = (typeof manifest)[number]["file"];

export type TiloukiImageFamily =
  | "category"
  | "ritual"
  | "home"
  | "blog"
  | "detail"
  | "guide";

export interface TiloukiImage {
  key: TiloukiImageKey;
  path: string;
  src: `${typeof TILOUKI_IMAGE_BASE}/${string}`;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
  licenseUrl: string;
  family: TiloukiImageFamily;
}

type ManifestEntry = (typeof manifest)[number];

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 1067;

function inferFamily(folder: string): TiloukiImageFamily {
  if (folder.startsWith("01-categories")) return "category";
  if (folder.startsWith("02-rituels")) return "ritual";
  if (folder.startsWith("03-home")) return "home";
  if (folder.startsWith("04-blog")) return "blog";
  if (folder.startsWith("05-details")) return "detail";
  return "guide";
}

function buildImage(entry: ManifestEntry): TiloukiImage {
  const path = entry.path ?? `${entry.folder}/${entry.file}.jpg`;
  return {
    key: entry.file as TiloukiImageKey,
    path,
    src: `${TILOUKI_IMAGE_BASE}/${path}`,
    alt: entry.alt,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    credit: `${entry.provider} — ${entry.photographer}`,
    sourceUrl: entry.sourceUrl,
    licenseUrl: entry.licenseUrl,
    family: inferFamily(entry.folder),
  };
}

export const tiloukiImages: Record<TiloukiImageKey, TiloukiImage> = Object.fromEntries(
  manifest.map((entry) => [entry.file, buildImage(entry)]),
) as Record<TiloukiImageKey, TiloukiImage>;

/** Fallback déterministe par famille — jamais aléatoire. */
export const TILOUKI_FAMILY_FALLBACK: Record<TiloukiImageFamily, TiloukiImageKey> = {
  category: "categorie-vetements-enfant-rack",
  ritual: "rituel-bebe-panier-cocon",
  home: "home-hero-dressing-couleurs",
  blog: "blog-organisation-dressing",
  detail: "detail-body-rose-ourson",
  guide: "guide-tailles-tenues-enfants",
};

/** Catégories catalogue → visuel enfant cohérent. */
export const CATEGORY_TILOUKI_IMAGE: Record<string, TiloukiImageKey> = {
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
};

/** Rituels éditoriaux (slug) → moment visuel. */
export const RITUAL_TILOUKI_IMAGE: Record<string, TiloukiImageKey> = {
  "matin-presse": "rituel-matin-dressing-bebe",
  "nuit-calme": "rituel-nuit-calme-enfant-dort",
  "sortie-famille": "rituel-promenade-bulles",
  "jour-de-pluie": "rituel-jour-de-pluie-flaque",
  "petit-budget": "categorie-vetements-enfant-rack",
};

/** Articles blog (heroImageId) → visuel sujet. */
export const BLOG_HERO_TILOUKI_IMAGE: Record<string, TiloukiImageKey> = {
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
};

/** Blocs home / éditoriaux (id logique) → visuel pack. */
export const EDITORIAL_MODULE_TILOUKI_IMAGE: Record<string, TiloukiImageKey> = {
  "hero-home": "home-hero-dressing-couleurs",
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
  "ritual-rainy-day": "rituel-jour-de-pluie-flaque",
  "lecture-soir": "rituel-lecture-au-lit-pyjama",
  "cocooning-bebe": "rituel-bebe-panier-cocon",
};

export function getTiloukiImage(key: TiloukiImageKey): TiloukiImage {
  const image = tiloukiImages[key];
  if (!image) {
    throw new Error(`Image Tilouki inconnue : ${key}`);
  }
  return image;
}

export function getTiloukiImageOrNull(key: string | null | undefined): TiloukiImage | null {
  if (!key) return null;
  return tiloukiImages[key as TiloukiImageKey] ?? null;
}

export function resolveTiloukiImage(
  key: string | null | undefined,
  family: TiloukiImageFamily,
): TiloukiImage {
  const direct = getTiloukiImageOrNull(key);
  if (direct) return direct;
  return getTiloukiImage(TILOUKI_FAMILY_FALLBACK[family]);
}

export function resolveCategoryTiloukiImage(categorySlug: string): TiloukiImage {
  const key = CATEGORY_TILOUKI_IMAGE[categorySlug];
  return resolveTiloukiImage(key, "category");
}

export function resolveRitualTiloukiImage(ritualSlug: string): TiloukiImage {
  const key = RITUAL_TILOUKI_IMAGE[ritualSlug];
  return resolveTiloukiImage(key, "ritual");
}

export function resolveBlogHeroTiloukiImage(heroImageId: string): TiloukiImage {
  const key = BLOG_HERO_TILOUKI_IMAGE[heroImageId];
  return resolveTiloukiImage(key, "blog");
}

export function resolveEditorialModuleTiloukiImage(moduleId: string): TiloukiImage {
  const key = EDITORIAL_MODULE_TILOUKI_IMAGE[moduleId];
  return resolveTiloukiImage(key, "home");
}

export function resolveTiloukiAltFromSrc(src: string, fallback: string): string {
  if (!src.startsWith(TILOUKI_IMAGE_BASE)) return fallback;
  const relative = src.slice(TILOUKI_IMAGE_BASE.length + 1);
  const fileKey = relative.replace(/\.jpg$/i, "").split("/").pop();
  return getTiloukiImageOrNull(fileKey)?.alt ?? fallback;
}

export function isTiloukiPackImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const pathname = url.startsWith("http") ? new URL(url).pathname : url;
  return pathname.startsWith(TILOUKI_IMAGE_BASE);
}
