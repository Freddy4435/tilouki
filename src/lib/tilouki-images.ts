import manifest from "@/data/manifest-photos-tilouki.json";
import {
  BLOG_HERO_IMAGE_REGISTRY,
  CATALOGUE_SURFACE_IMAGE_REGISTRY,
  CATEGORY_IMAGE_REGISTRY,
  HOME_EDITORIAL_MODULE_REGISTRY,
  QUICK_ACCESS_IMAGE_REGISTRY,
  REASSURANCE_SURFACE_IMAGE_REGISTRY,
  RITUAL_IMAGE_REGISTRY,
  TILOUKI_FAMILY_FALLBACK_KEYS,
  isRegisteredTiloukiImageKey,
  resolveCategoryFallbackKey,
  resolveEditorialModuleFallbackKey,
  resolveRitualFallbackKey,
  type TiloukiImageKey,
} from "@/lib/tilouki-image-registry";

/** Racine publique du pack photos Tilouki 2026. */
export const TILOUKI_IMAGE_BASE = "/images/tilouki" as const;

export type { TiloukiImageKey };

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

/** @deprecated Utiliser CATEGORY_IMAGE_REGISTRY — alias de compatibilité. */
export const CATEGORY_TILOUKI_IMAGE: Record<string, TiloukiImageKey> =
  CATEGORY_IMAGE_REGISTRY;

/** @deprecated Utiliser RITUAL_IMAGE_REGISTRY. */
export const RITUAL_TILOUKI_IMAGE: Record<string, TiloukiImageKey> = RITUAL_IMAGE_REGISTRY;

/** @deprecated Utiliser BLOG_HERO_IMAGE_REGISTRY. */
export const BLOG_HERO_TILOUKI_IMAGE: Record<string, TiloukiImageKey> =
  BLOG_HERO_IMAGE_REGISTRY;

/** @deprecated Utiliser HOME_EDITORIAL_MODULE_REGISTRY. */
export const EDITORIAL_MODULE_TILOUKI_IMAGE: Record<string, TiloukiImageKey> =
  HOME_EDITORIAL_MODULE_REGISTRY;

/** Fallback déterministe par famille — jamais aléatoire. */
export const TILOUKI_FAMILY_FALLBACK: Record<TiloukiImageFamily, TiloukiImageKey> = {
  category: TILOUKI_FAMILY_FALLBACK_KEYS.category,
  ritual: TILOUKI_FAMILY_FALLBACK_KEYS.ritual,
  home: TILOUKI_FAMILY_FALLBACK_KEYS.home,
  blog: TILOUKI_FAMILY_FALLBACK_KEYS.blog,
  detail: TILOUKI_FAMILY_FALLBACK_KEYS.detail,
  guide: TILOUKI_FAMILY_FALLBACK_KEYS.guide,
};

export {
  BLOG_HERO_IMAGE_REGISTRY,
  CATALOGUE_SURFACE_IMAGE_REGISTRY,
  CATEGORY_IMAGE_REGISTRY,
  HOME_EDITORIAL_MODULE_REGISTRY,
  QUICK_ACCESS_IMAGE_REGISTRY,
  REASSURANCE_SURFACE_IMAGE_REGISTRY,
  RITUAL_IMAGE_REGISTRY,
} from "@/lib/tilouki-image-registry";

export function getTiloukiImage(key: TiloukiImageKey): TiloukiImage {
  const image = tiloukiImages[key];
  if (!image) {
    throw new Error(`Image Tilouki inconnue : ${key}`);
  }
  return image;
}

export function getTiloukiImageOrNull(
  key: string | null | undefined,
): TiloukiImage | null {
  if (!key || !isRegisteredTiloukiImageKey(key)) return null;
  return tiloukiImages[key];
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
  const key =
    CATEGORY_IMAGE_REGISTRY[categorySlug as keyof typeof CATEGORY_IMAGE_REGISTRY] ??
    resolveCategoryFallbackKey(categorySlug);
  return getTiloukiImage(key);
}

export function resolveRitualTiloukiImage(ritualSlug: string): TiloukiImage {
  const key =
    RITUAL_IMAGE_REGISTRY[ritualSlug as keyof typeof RITUAL_IMAGE_REGISTRY] ??
    resolveRitualFallbackKey(ritualSlug);
  return getTiloukiImage(key);
}

export function resolveBlogHeroTiloukiImage(heroImageId: string): TiloukiImage {
  const key =
    BLOG_HERO_IMAGE_REGISTRY[heroImageId as keyof typeof BLOG_HERO_IMAGE_REGISTRY] ??
    TILOUKI_FAMILY_FALLBACK.blog;
  return getTiloukiImage(key);
}

export function resolveEditorialModuleTiloukiImage(moduleId: string): TiloukiImage {
  const key =
    HOME_EDITORIAL_MODULE_REGISTRY[
      moduleId as keyof typeof HOME_EDITORIAL_MODULE_REGISTRY
    ] ?? resolveEditorialModuleFallbackKey(moduleId);
  return getTiloukiImage(key);
}

export function resolveQuickAccessTiloukiImage(moduleId: string): TiloukiImage {
  const key =
    QUICK_ACCESS_IMAGE_REGISTRY[moduleId as keyof typeof QUICK_ACCESS_IMAGE_REGISTRY] ??
    resolveCategoryFallbackKey(moduleId);
  return getTiloukiImage(key);
}

export function resolveCatalogueSurfaceTiloukiImage(surfaceId: string): TiloukiImage {
  const key =
    CATALOGUE_SURFACE_IMAGE_REGISTRY[
      surfaceId as keyof typeof CATALOGUE_SURFACE_IMAGE_REGISTRY
    ] ?? TILOUKI_FAMILY_FALLBACK.category;
  return getTiloukiImage(key);
}

export function resolveReassuranceTiloukiImage(surfaceId: string): TiloukiImage {
  const key =
    REASSURANCE_SURFACE_IMAGE_REGISTRY[
      surfaceId as keyof typeof REASSURANCE_SURFACE_IMAGE_REGISTRY
    ] ?? TILOUKI_FAMILY_FALLBACK.guide;
  return getTiloukiImage(key);
}

export function resolveTiloukiAltFromSrc(src: string, fallback: string): string {
  if (!src.startsWith(TILOUKI_IMAGE_BASE)) return fallback;
  const relative = src.slice(TILOUKI_IMAGE_BASE.length + 1);
  const fileKey = relative
    .replace(/\.jpg$/i, "")
    .split("/")
    .pop();
  return getTiloukiImageOrNull(fileKey)?.alt ?? fallback;
}

export function isTiloukiPackImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const pathname = url.startsWith("/")
      ? (url.split("?")[0] ?? url)
      : new URL(url).pathname;
    return pathname.startsWith(TILOUKI_IMAGE_BASE);
  } catch {
    return url.includes("/images/tilouki/");
  }
}

/**
 * Message admin : le pack Tilouki est réservé aux surfaces éditoriales (home, catégories, guides).
 * Ne jamais l'utiliser comme photo produit vendable.
 */
export const TILOUKI_PACK_PRODUCT_PHOTO_NOTICE =
  "Les photos du pack Tilouki servent aux catégories, à la home et aux guides. Les fiches produit nécessitent de vraies photos de l'article vendu.";

/** Interdit explicitement le pack Tilouki comme image produit (validation admin / import). */
export function assertNotTiloukiPackProductImage(
  url: string | null | undefined,
  context = "fiche produit",
): void {
  if (isTiloukiPackImageUrl(url)) {
    throw new Error(
      `Le pack Tilouki est interdit comme photo produit vendable (${context}). ${TILOUKI_PACK_PRODUCT_PHOTO_NOTICE}`,
    );
  }
}
