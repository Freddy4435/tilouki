import { isDevSeedProductSlug } from "@/lib/catalog/dev-seed";
import { isTiloukiPackImageUrl } from "@/lib/tilouki-images";
import type { ProductImage, ProductListItem } from "@/types/catalog";

/** Visuel catalogue / placeholder — ne doit pas être vendu tel quel. */
export type ProductImageKind =
  | "commercial"
  | "technical"
  | "demo-generated"
  | "placeholder"
  | "dev-marked";

export type StorefrontImageLike = {
  url: string;
  alt?: string | null;
};

/** Minimum de photos commerciales pour apparaître en catalogue / home. */
export const STOREFRONT_COMMERCIAL_PHOTOS_MIN = 1;

/** Recommandation admin pour une fiche « prête à vendre ». */
export const STOREFRONT_READY_TO_SELL_PHOTOS_MIN = 3;

const DEFECT_ALT_PATTERN = /défaut|defaut|imperfection|trace|tache|usure/i;
const SECOND_HAND_PATTERN =
  /seconde\s*main|seconde-main|occasion|pré-?loved|pre-?owned/i;

const DEV_ALT_PATTERN = /\[dev\]/i;
const PLACEHOLDER_ALT_PATTERN =
  /photo\s*à\s*venir|placeholder|visuel\s*démo|image\s*provisoire/i;
const PLACEHOLDER_URL_PATTERN =
  /placeholder|placehold\.co|via\.placeholder|dummyimage|lorempixel|picsum\.photos/i;

const STOCK_PHOTO_HOST_PATTERN =
  /(?:pexels\.com|unsplash\.com|pixabay\.com|images\.pexels\.com)/i;
const EDITORIAL_ASSET_PATH_PATTERN = /^\/(?:editorial|images\/tilouki)\//i;

/** URLs interdites comme photo produit (stock, pack Tilouki ou éditorial local). */
export function isStockOrEditorialImageUrl(url: string): boolean {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return false;

  if (isTiloukiPackImageUrl(trimmed)) return true;

  const pathname = normalizePathname(trimmed);
  if (EDITORIAL_ASSET_PATH_PATTERN.test(pathname)) return true;
  return STOCK_PHOTO_HOST_PATTERN.test(trimmed);
}

/** Alias explicite — pack `/images/tilouki/...` réservé aux surfaces éditoriales. */
export function isEditorialPackImageUrl(url: string): boolean {
  return (
    isTiloukiPackImageUrl(url) ||
    EDITORIAL_ASSET_PATH_PATTERN.test(normalizePathname(url))
  );
}

const DEMO_CATALOG_SVG_PATTERN = /^\/products\/[a-z0-9-]+\.svg$/i;
const DEMO_PRODUCTS_PATH_PATTERN = /^\/demo-products\//i;

/** Longueur minimale pour un alt descriptif (hors nom produit seul). */
export const COMMERCIAL_ALT_MIN_LENGTH = 8;

/** Slugs techniques / recette — jamais listés ni vendus sur le storefront. */
export const STOREFRONT_BLOCKED_TECHNICAL_SLUGS = [
  "produit-test-csp",
  "article-test-e2e",
] as const;

function normalizePathname(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    if (trimmed.startsWith("/")) return trimmed.split("?")[0] ?? trimmed;
    const parsed = new URL(trimmed, "https://tilouki.local");
    return parsed.pathname;
  } catch {
    return trimmed.split("?")[0] ?? trimmed;
  }
}

export function isDescriptiveCommercialAlt(alt: string | null | undefined): boolean {
  const trimmed = alt?.trim() ?? "";
  if (trimmed.length < COMMERCIAL_ALT_MIN_LENGTH) return false;
  if (PLACEHOLDER_ALT_PATTERN.test(trimmed)) return false;
  if (DEV_ALT_PATTERN.test(trimmed)) return false;
  return true;
}

export function classifyProductImage(
  url: string,
  alt?: string | null,
): ProductImageKind {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "placeholder";

  if (isStockOrEditorialImageUrl(trimmed)) return "technical";

  if (alt && DEV_ALT_PATTERN.test(alt)) return "dev-marked";
  if (PLACEHOLDER_URL_PATTERN.test(trimmed)) return "placeholder";

  const pathname = normalizePathname(trimmed);

  if (DEMO_CATALOG_SVG_PATTERN.test(pathname)) return "demo-generated";
  if (DEMO_PRODUCTS_PATH_PATTERN.test(pathname)) return "demo-generated";
  if (pathname.endsWith(".svg")) return "technical";
  if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(pathname)) {
    if (pathname.includes("/products/") && pathname.endsWith(".gif")) {
      return "technical";
    }
    return "commercial";
  }

  if (trimmed.includes("/product-images/") || trimmed.includes("product-images")) {
    return "commercial";
  }

  return "technical";
}

/**
 * Photo réelle utilisable en vitrine : raster uploadé ou bucket, alt descriptif obligatoire.
 * Exclut SVG catalogue, placeholders et textes « Photo à venir ».
 */
export function isCommercialProductImage(url: string, alt?: string | null): boolean {
  if (classifyProductImage(url, alt) !== "commercial") return false;
  return isDescriptiveCommercialAlt(alt);
}

export function countCommercialStorefrontImages(images: StorefrontImageLike[]): number {
  return filterCommercialStorefrontImages(images).length;
}

/** Photos réelles exploitables en fiche produit / carte — exclut pack Tilouki et placeholders. */
export function filterCommercialStorefrontImages<T extends StorefrontImageLike>(
  images: T[],
): T[] {
  return images.filter(
    (image) =>
      Boolean(image.url?.trim()) &&
      isCommercialProductImage(image.url, image.alt ?? null),
  );
}

/** Alias pour galeries fiche produit. */
export function filterCommercialProductImages(images: ProductImage[]): ProductImage[] {
  return filterCommercialStorefrontImages(images);
}

export function isProductReadyToSell(images: StorefrontImageLike[]): boolean {
  return countCommercialStorefrontImages(images) >= STOREFRONT_READY_TO_SELL_PHOTOS_MIN;
}

export function isStorefrontBlockedSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return true;
  if (isDevSeedProductSlug(normalized)) return true;
  return (STOREFRONT_BLOCKED_TECHNICAL_SLUGS as readonly string[]).includes(normalized);
}

export function hasCommercialStorefrontImages(images: StorefrontImageLike[]): boolean {
  return countCommercialStorefrontImages(images) >= STOREFRONT_COMMERCIAL_PHOTOS_MIN;
}

/** Produit visible dans catalogue, home et suggestions (photo commerciale + slug autorisé). */
export function isProductStorefrontListed(
  product: Pick<ProductListItem, "slug" | "primaryImageUrl" | "primaryImageAlt">,
): boolean {
  if (isStorefrontBlockedSlug(product.slug)) return false;
  if (!product.primaryImageUrl?.trim()) return false;
  return isCommercialProductImage(
    product.primaryImageUrl,
    product.primaryImageAlt ?? null,
  );
}

export function filterStorefrontListedProducts<T extends ProductListItem>(
  products: T[],
): T[] {
  return products.filter(isProductStorefrontListed);
}

/** Fiche produit : au moins une photo commerciale pour activer l'achat. */
export function isProductStorefrontSellable(images: ProductImage[]): boolean {
  return hasCommercialStorefrontImages(images);
}

export function extractDocumentedDefects(images: ProductImage[]): string[] {
  const notices = new Set<string>();

  for (const image of images) {
    const alt = image.alt?.trim();
    if (alt && DEFECT_ALT_PATTERN.test(alt)) {
      notices.add(alt);
    }
  }

  return [...notices];
}

export function isLikelySecondHandProduct(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  return SECOND_HAND_PATTERN.test(text);
}

export type StorefrontListingBlockerId =
  | "blocked-slug"
  | "no-primary-image"
  | "demo-generated-image"
  | "technical-image"
  | "placeholder-image"
  | "editorial-pack-image"
  | "dev-marked-image"
  | "missing-descriptive-alt";

export interface StorefrontListingBlocker {
  id: StorefrontListingBlockerId;
  /** Message admin en français simple — pourquoi le produit n'apparaît pas en boutique. */
  message: string;
}

function blockerForImageKind(
  kind: ProductImageKind,
  url: string,
): StorefrontListingBlocker | null {
  if (isEditorialPackImageUrl(url)) {
    return {
      id: "editorial-pack-image",
      message:
        "La photo principale vient du pack Tilouki ou d'une banque d'images — elle ne peut pas servir en boutique. Uploadez une vraie photo de l'article.",
    };
  }

  switch (kind) {
    case "demo-generated":
      return {
        id: "demo-generated-image",
        message:
          "La photo principale est un visuel démo (SVG catalogue) — remplacez-la par une photo JPEG, PNG ou WebP de l'article réel.",
      };
    case "technical":
      return {
        id: "technical-image",
        message:
          "La photo principale n'est pas une vraie photo produit (format SVG ou fichier technique) — uploadez une photo de l'article.",
      };
    case "placeholder":
      return {
        id: "placeholder-image",
        message:
          "La photo principale est un placeholder (« Photo à venir ») — ajoutez une vraie photo face avant avec une description.",
      };
    case "dev-marked":
      return {
        id: "dev-marked-image",
        message:
          "La photo principale est marquée [DEV] — remplacez-la par une photo commerciale avant mise en boutique.",
      };
    case "commercial":
      return null;
  }
}

/** Explique pourquoi un produit n'apparaît pas en catalogue / accueil (langage admin). */
export function getStorefrontListingBlockers(
  product: Pick<ProductListItem, "slug" | "primaryImageUrl" | "primaryImageAlt">,
): StorefrontListingBlocker[] {
  const blockers: StorefrontListingBlocker[] = [];

  if (isStorefrontBlockedSlug(product.slug)) {
    blockers.push({
      id: "blocked-slug",
      message:
        "Produit réservé aux tests ou à la démo — il reste invisible dans le catalogue et sur l'accueil.",
    });
    return blockers;
  }

  const primaryUrl = product.primaryImageUrl?.trim();
  if (!primaryUrl) {
    blockers.push({
      id: "no-primary-image",
      message:
        "Aucune photo principale — le produit n'apparaît ni sur l'accueil ni dans le catalogue.",
    });
    return blockers;
  }

  const kind = classifyProductImage(primaryUrl, product.primaryImageAlt);
  const kindBlocker = blockerForImageKind(kind, primaryUrl);
  if (kindBlocker) {
    blockers.push(kindBlocker);
    return blockers;
  }

  if (!isDescriptiveCommercialAlt(product.primaryImageAlt)) {
    blockers.push({
      id: "missing-descriptive-alt",
      message:
        "La description de la photo principale est manquante ou trop vague (minimum 8 caractères, pas « Photo à venir ») — complétez-la pour apparaître en boutique.",
    });
  }

  return blockers;
}

/** Variante admin : première image triée = photo principale catalogue. */
export function getStorefrontListingBlockersFromImages(
  slug: string,
  images: StorefrontImageLike[],
): StorefrontListingBlocker[] {
  const sorted = [...images].sort(
    (a, b) =>
      ((a as { sortOrder?: number }).sortOrder ?? 0) -
      ((b as { sortOrder?: number }).sortOrder ?? 0),
  );
  const primary = sorted[0];
  const commercial = pickStorefrontPrimaryFromImages(sorted);

  return getStorefrontListingBlockers({
    slug,
    primaryImageUrl: commercial?.url ?? primary?.url ?? null,
    primaryImageAlt: commercial?.alt ?? primary?.alt ?? null,
  });
}

function pickStorefrontPrimaryFromImages(
  images: StorefrontImageLike[],
): StorefrontImageLike | null {
  return (
    images.find((image) =>
      isCommercialProductImage(image.url, image.alt ?? null),
    ) ?? null
  );
}

export type StorefrontPhotoStatus = "hidden" | "listed" | "ready-to-sell";

export function getStorefrontPhotoStatus(
  images: StorefrontImageLike[],
): {
  status: StorefrontPhotoStatus;
  commercialCount: number;
  targetCount: number;
} {
  const commercialCount = countCommercialStorefrontImages(images);
  const targetCount = STOREFRONT_READY_TO_SELL_PHOTOS_MIN;

  if (commercialCount >= targetCount) {
    return { status: "ready-to-sell", commercialCount, targetCount };
  }
  if (commercialCount >= STOREFRONT_COMMERCIAL_PHOTOS_MIN) {
    return { status: "listed", commercialCount, targetCount };
  }
  return { status: "hidden", commercialCount, targetCount };
}
