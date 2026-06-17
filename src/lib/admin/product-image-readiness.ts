import { PRODUCT_IMAGE_PROFILE } from "@/lib/admin/image-upload";
import {
  countCommercialStorefrontImages,
  isCommercialProductImage,
  isDescriptiveCommercialAlt,
  isEditorialPackImageUrl,
  isProductReadyToSell,
  STOREFRONT_READY_TO_SELL_PHOTOS_MIN,
  type ProductImageKind,
} from "@/lib/catalog/product-sellability";
import { TILOUKI_PACK_PRODUCT_PHOTO_NOTICE } from "@/lib/tilouki-images";

export type { ProductImageKind } from "@/lib/catalog/product-sellability";
export {
  classifyProductImage,
  countCommercialStorefrontImages,
  findLegacyDemoProductImageIssues,
  getStorefrontListingBlockers,
  getStorefrontListingBlockersFromImages,
  getStorefrontPhotoStatus,
  hasLegacyDemoProductImages,
  isCommercialProductImage,
  isDescriptiveCommercialAlt,
  isLegacyDemoProductImageUrl,
  isProductReadyToSell,
  STOREFRONT_COMMERCIAL_PHOTOS_MIN,
  STOREFRONT_READY_TO_SELL_PHOTOS_MIN,
  type LegacyDemoProductImageIssue,
  type StorefrontListingBlocker,
  type StorefrontPhotoStatus,
} from "@/lib/catalog/product-sellability";

export interface ProductReadinessImage {
  url: string;
  alt?: string | null;
  sortOrder?: number;
  width?: number | null;
  height?: number | null;
}

const DETAIL_ALT_PATTERN = /détail|detail|matière|matiere|texture|couture/i;
const SCENE_ALT_PATTERN =
  /pliage|plié|plie|porté|porte|flat\s*lay|mise\s*en\s*scene|mise\s*en\s*scène|cintre/i;
const DEFECT_ALT_PATTERN = /défaut|defaut|imperfection|trace/i;

export function getProductImageKindLabel(
  kind: ProductImageKind,
  url?: string | null,
): string {
  if (isEditorialPackImageUrl(url ?? "")) {
    return "Pack Tilouki — éditorial uniquement";
  }

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
  | "alt-descriptif"
  | "detail-matiere"
  | "vue-portee-ou-defaut"
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
      label: "Photo face / produit entier",
      tier: "required",
      filled: Boolean(mainCommercial),
      hint: "Première photo : vêtement entier à plat ou sur cintre, fond clair chaud, lumière naturelle.",
    },
    {
      id: "alt-descriptif",
      label: "Description photo (alt text)",
      tier: "required",
      filled: Boolean(
        mainCommercial?.alt && isDescriptiveCommercialAlt(mainCommercial.alt),
      ),
      hint: "Décrivez la vue réelle (ex. « Body bébé face avant, coton écru »). Minimum 8 caractères — pas « Photo à venir ».",
    },
    {
      id: "detail-matiere",
      label: "2ᵉ photo — détail matière ou finition",
      tier: "recommended",
      filled: commercial.length >= 2 || altMatches(commercial, DETAIL_ALT_PATTERN),
      hint: "Gros plan tissu, maille ou couture — mentionnez « détail matière » dans la description.",
    },
    {
      id: "vue-portee-ou-defaut",
      label: "3ᵉ photo — vue portée, cintre ou pliage",
      tier: "recommended",
      filled:
        commercial.length >= 3 ||
        altMatches(commercial, SCENE_ALT_PATTERN) ||
        altMatches(commercial, DEFECT_ALT_PATTERN),
      hint: "Sur mannequin enfant, sur cintre dans le dressing, ou plié proprement — mentionnez « porté », « cintre » ou « pliage » dans la description.",
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

export type ExpectedProductPhotoSlotId = "face-avant" | "detail-matiere" | "vue-portee";

export interface ExpectedProductPhotoSlot {
  id: ExpectedProductPhotoSlotId;
  label: string;
  filled: boolean;
  hint: string;
  exampleFilename: string;
  exampleAlt: string;
}

export const STOREFRONT_PHOTO_STATUS_LABELS = {
  hidden: "Invisible en boutique",
  listed: "Visible catalogue",
  "ready-to-sell": "Prêt à vendre",
} as const;

export function getExpectedProductPhotoSlots(
  images: ProductReadinessImage[],
  options?: BuildProductPhotoChecklistOptions,
): ExpectedProductPhotoSlot[] {
  const checklist = buildProductPhotoChecklist(images, options);

  const byId = Object.fromEntries(checklist.map((item) => [item.id, item])) as Record<
    ProductPhotoChecklistId,
    ProductPhotoChecklistItem
  >;

  return [
    {
      id: "face-avant",
      label: "Face avant — produit entier",
      filled: byId["face-avant"]?.filled ?? false,
      hint: byId["face-avant"]?.hint ?? "",
      exampleFilename: "body-bebe-coton-ecru-face-avant.jpg",
      exampleAlt: "Body bébé face avant, coton écru, col rond",
    },
    {
      id: "detail-matiere",
      label: "Détail matière ou finition",
      filled: byId["detail-matiere"]?.filled ?? false,
      hint: byId["detail-matiere"]?.hint ?? "",
      exampleFilename: "body-bebe-coton-ecru-detail-matiere.jpg",
      exampleAlt: "Détail matière — maille coton bio douce",
    },
    {
      id: "vue-portee",
      label: "Portée, mise en situation ou défaut",
      filled:
        (byId["vue-portee-ou-defaut"]?.filled ?? false) ||
        Boolean(options?.secondHand && byId["defaut-documente"]?.filled),
      hint: options?.secondHand
        ? "Vue portée ou pliage — et photo défaut obligatoire en seconde main."
        : (byId["vue-portee-ou-defaut"]?.hint ?? ""),
      exampleFilename: "body-bebe-coton-ecru-porte-mannequin.jpg",
      exampleAlt: "Body bébé porté sur mannequin 3 mois, vue de face",
    },
  ];
}

export function getMissingExpectedPhotoSlots(
  images: ProductReadinessImage[],
  options?: BuildProductPhotoChecklistOptions,
): ExpectedProductPhotoSlot[] {
  return getExpectedProductPhotoSlots(images, options).filter((slot) => !slot.filled);
}

export function getNonCommercialMainImageMessage(
  kind: ProductImageKind,
  url?: string | null,
): string {
  if (isEditorialPackImageUrl(url ?? "")) {
    return TILOUKI_PACK_PRODUCT_PHOTO_NOTICE;
  }

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
