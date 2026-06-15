import { isDevSeedProductSlug } from "@/lib/catalog/dev-seed";
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
const EDITORIAL_ASSET_PATH_PATTERN = /^\/editorial\//i;

/** URLs interdites comme photo produit (stock ou éditorial local). */
export function isStockOrEditorialImageUrl(url: string): boolean {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return false;

  const pathname = normalizePathname(trimmed);
  if (EDITORIAL_ASSET_PATH_PATTERN.test(pathname)) return true;
  return STOCK_PHOTO_HOST_PATTERN.test(trimmed);
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
  return images.filter(
    (image) =>
      Boolean(image.url?.trim()) &&
      isCommercialProductImage(image.url, image.alt ?? null),
  ).length;
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
