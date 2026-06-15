import { PRODUCT_IMAGE_PROFILE } from "@/lib/admin/image-upload";
import {
  classifyProductImage,
  countCommercialStorefrontImages,
  isCommercialProductImage,
  isProductReadyToSell,
  STOREFRONT_READY_TO_SELL_PHOTOS_MIN,
  type ProductImageKind,
} from "@/lib/catalog/product-sellability";

export type { ProductImageKind } from "@/lib/catalog/product-sellability";
export {
  classifyProductImage,
  countCommercialStorefrontImages,
  isCommercialProductImage,
  isDescriptiveCommercialAlt,
  isProductReadyToSell,
  STOREFRONT_COMMERCIAL_PHOTOS_MIN,
  STOREFRONT_READY_TO_SELL_PHOTOS_MIN,
} from "@/lib/catalog/product-sellability";

export interface ProductReadinessImage {
  url: string;
  alt?: string | null;
  sortOrder?: number;
  width?: number | null;
  height?: number | null;
}

const DETAIL_ALT_PATTERN = /détail|detail|matière|matiere|texture|couture/i;
const DEFECT_ALT_PATTERN = /défaut|defaut|imperfection|trace/i;
const COLOR_ALT_PATTERN =
  /couleur|coloris|teinte|bleu|rouge|rose|vert|jaune|noir|blanc|gris|beige|marine|violet|orange|multicolore/i;

export function getProductImageKindLabel(kind: ProductImageKind): string {
  switch (kind) {
    case "commercial":
      return "Photo commerciale";
    case "demo-generated":
      return "Visuel démo généré";
    case "technical":
      return "Image technique";
    case "placeholder":
      return "Placeholder";
    case "dev-marked":
      return "Marquée DEV";
  }
}

export function sortReadinessImages(
  images: ProductReadinessImage[],
): ProductReadinessImage[] {
  return [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getMainProductImage(
  images: ProductReadinessImage[],
): ProductReadinessImage | null {
  const sorted = sortReadinessImages(images);
  return sorted[0] ?? null;
}

export function getCommercialProductImages(
  images: ProductReadinessImage[],
): ProductReadinessImage[] {
  return sortReadinessImages(images).filter((image) =>
    isCommercialProductImage(image.url, image.alt),
  );
}

export function pickStorefrontPrimaryImage(
  images: ProductReadinessImage[],
): ProductReadinessImage | null {
  const commercial = getCommercialProductImages(images);
  return commercial[0] ?? null;
}

function hasPortraitRatio(image: ProductReadinessImage): boolean {
  const { width, height } = image;
  if (!width || !height || width <= 0 || height <= 0) return false;
  const ratio = width / height;
  return (
    ratio >= PRODUCT_IMAGE_PROFILE.ratioMin && ratio <= PRODUCT_IMAGE_PROFILE.ratioMax
  );
}

function altMatches(images: ProductReadinessImage[], pattern: RegExp): boolean {
  return images.some((image) => pattern.test(image.alt ?? ""));
}

export type ProductPhotoChecklistId =
  | "face-avant"
  | "detail-matiere"
  | "couleur-fidele"
  | "defaut-documente"
  | "ratio-portrait";

export type ProductPhotoChecklistTier = "required" | "recommended" | "optional";

export interface ProductPhotoChecklistItem {
  id: ProductPhotoChecklistId;
  label: string;
  tier: ProductPhotoChecklistTier;
  filled: boolean;
  hint: string;
}

export interface BuildProductPhotoChecklistOptions {
  secondHand?: boolean;
}

export function buildProductPhotoChecklist(
  images: ProductReadinessImage[],
  options?: BuildProductPhotoChecklistOptions,
): ProductPhotoChecklistItem[] {
  const commercial = getCommercialProductImages(images);
  const main = getMainProductImage(images);
  const mainCommercial =
    main && isCommercialProductImage(main.url, main.alt)
      ? main
      : (commercial[0] ?? null);
  const secondHand = options?.secondHand ?? false;

  return [
    {
      id: "face-avant",
      label: "Photo face avant (image principale)",
      tier: "required",
      filled: Boolean(mainCommercial),
      hint: "Première photo : vêtement porté à plat ou sur cintre, fond neutre, lumière naturelle. Alt descriptif obligatoire (min. 8 caractères).",
    },
    {
      id: "detail-matiere",
      label: "Détail matière ou couture",
      tier: "recommended",
      filled: commercial.length >= 2 || altMatches(commercial, DETAIL_ALT_PATTERN),
      hint: "Ajoutez un gros plan tissu, maille ou finition — renseignez « détail matière » dans la description photo.",
    },
    {
      id: "couleur-fidele",
      label: "Couleur fidèle au vêtement",
      tier: "recommended",
      filled: commercial.length >= 3 || altMatches(commercial, COLOR_ALT_PATTERN),
      hint: "Photographiez la teinte réelle (lumière naturelle) et précisez la couleur dans la description photo.",
    },
    {
      id: "defaut-documente",
      label: "Défaut documenté (seconde main)",
      tier: secondHand ? "required" : "optional",
      filled: secondHand ? altMatches(commercial, DEFECT_ALT_PATTERN) : true,
      hint: secondHand
        ? "Article seconde main : photographiez tout défaut visible et décrivez-le dans l'alt (tache, usure, fil tiré…)."
        : "Uniquement si le vêtement présente un défaut visible.",
    },
    {
      id: "ratio-portrait",
      label: `Ratio portrait cohérent (${PRODUCT_IMAGE_PROFILE.recommendedRatioLabel})`,
      tier: "recommended",
      filled: commercial.some(hasPortraitRatio),
      hint: `Ciblez ${PRODUCT_IMAGE_PROFILE.recommendedRatioLabel} (ex. 1200×1500 px) pour un rendu homogène catalogue et fiche produit.`,
    },
  ];
}

export function getPhotoReadinessSummary(images: ProductReadinessImage[]): {
  commercialCount: number;
  readyToSell: boolean;
  targetCount: number;
} {
  const commercialCount = countCommercialStorefrontImages(images);
  return {
    commercialCount,
    readyToSell: isProductReadyToSell(images),
    targetCount: STOREFRONT_READY_TO_SELL_PHOTOS_MIN,
  };
}

export function getNonCommercialMainImageMessage(kind: ProductImageKind): string {
  switch (kind) {
    case "demo-generated":
      return "Image principale générée (SVG catalogue démo) — remplacez-la par une photo réelle uploadée.";
    case "technical":
      return "Image principale technique (SVG ou format non photo) — utilisez une photo JPEG, PNG ou WebP.";
    case "placeholder":
      return "Image principale provisoire — ajoutez une vraie photo produit.";
    case "dev-marked":
      return "Image principale marquée [DEV] — remplacez-la par une photo commerciale.";
    case "commercial":
      return "";
  }
}
