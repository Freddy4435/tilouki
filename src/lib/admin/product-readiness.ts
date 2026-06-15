import {
  classifyProductImage,
  countCommercialStorefrontImages,
  getMainProductImage,
  getNonCommercialMainImageMessage,
  isCommercialProductImage,
  isDescriptiveCommercialAlt,
  type ProductReadinessImage,
} from "@/lib/admin/product-image-readiness";
import { isDevSeedProductSlug } from "@/lib/catalog/dev-seed";
import { STOREFRONT_READY_TO_SELL_PHOTOS_MIN } from "@/lib/catalog/product-sellability";

export type { ProductReadinessImage } from "@/lib/admin/product-image-readiness";

export type ProductReadinessIssueId =
  | "demo-product"
  | "no-category"
  | "no-photos"
  | "demo-main-image"
  | "technical-main-image"
  | "placeholder-main-image"
  | "dev-marked-main-image"
  | "missing-descriptive-alt"
  | "recommended-more-photos"
  | "no-stock"
  | "no-price"
  | "no-size"
  | "no-weight"
  | "no-sellable-variant";

export interface ProductReadinessIssue {
  id: ProductReadinessIssueId;
  message: string;
  /** false = recommandation admin, n'empêche pas la publication */
  blocking?: boolean;
}

export interface ProductReadinessVariant {
  stockQuantity: number;
  weightGrams: number | null;
  isActive: boolean;
  priceCents?: number;
  sizeLabel?: string | null;
  ageLabel?: string | null;
}

export interface ProductReadinessInput {
  images?: ProductReadinessImage[];
  /** @deprecated Préférer `images` avec URL pour valider la photo commerciale. */
  imagesCount?: number;
  variants: ProductReadinessVariant[];
  categoryId?: string | null;
  slug?: string;
}

function hasSizeOrAge(variant: ProductReadinessVariant): boolean {
  return Boolean(variant.sizeLabel?.trim() || variant.ageLabel?.trim());
}

function issueIdForImageKind(
  kind: ReturnType<typeof classifyProductImage>,
): ProductReadinessIssueId | null {
  switch (kind) {
    case "commercial":
      return null;
    case "demo-generated":
      return "demo-main-image";
    case "technical":
      return "technical-main-image";
    case "placeholder":
      return "placeholder-main-image";
    case "dev-marked":
      return "dev-marked-main-image";
  }
}

function appendMainImageIssues(
  issues: ProductReadinessIssue[],
  images: ProductReadinessImage[],
): void {
  const main = getMainProductImage(images);

  if (!main?.url?.trim()) {
    issues.push({
      id: "no-photos",
      message:
        "Aucune image principale — ajoutez une photo commerciale (face avant) pour publier la fiche.",
    });
    return;
  }

  const kind = classifyProductImage(main.url, main.alt);
  const issueId = issueIdForImageKind(kind);
  if (issueId) {
    issues.push({
      id: issueId,
      message: getNonCommercialMainImageMessage(kind),
    });
    return;
  }

  if (!isDescriptiveCommercialAlt(main.alt)) {
    issues.push({
      id: "missing-descriptive-alt",
      message:
        "Description photo (alt) manquante ou trop vague sur l'image principale — décrivez la vue (ex. « Robe fille face avant, coton bleu »). Les textes « Photo à venir » sont interdits.",
    });
    return;
  }

  if (!isCommercialProductImage(main.url, main.alt)) {
    issues.push({
      id: "missing-descriptive-alt",
      message:
        "L'image principale n'est pas une photo commerciale valide — utilisez un JPEG/PNG/WebP uploadé avec une description descriptive.",
    });
  }
}

export function getProductReadinessIssues(
  params: ProductReadinessInput,
): ProductReadinessIssue[] {
  const issues: ProductReadinessIssue[] = [];
  const activeVariants = params.variants.filter((v) => v.isActive);
  const images = params.images ?? [];

  if (params.slug && isDevSeedProductSlug(params.slug)) {
    issues.push({
      id: "demo-product",
      message:
        "Produit de démonstration — désactivez-le ou importez votre catalogue réel avant vente.",
    });
  }

  if (!params.categoryId?.trim()) {
    issues.push({
      id: "no-category",
      message: "Catégorie manquante — assignez une catégorie de navigation.",
    });
  }

  if (images.length > 0) {
    appendMainImageIssues(issues, images);
  } else if ((params.imagesCount ?? 0) === 0) {
    issues.push({
      id: "no-photos",
      message:
        "Aucune image principale — ajoutez une photo commerciale (face avant) pour publier la fiche.",
    });
  }

  if (activeVariants.length === 0) {
    issues.push({
      id: "no-sellable-variant",
      message: "Aucune variante active — activez au moins une taille ou un âge.",
    });
  } else {
    const sellableVariants = activeVariants.filter((v) => v.stockQuantity > 0);
    if (sellableVariants.length === 0) {
      issues.push({
        id: "no-stock",
        message:
          "Stock à zéro sur toutes les variantes actives — renseignez le stock pour vendre.",
      });
    }

    const missingPrice = activeVariants.some(
      (v) => v.priceCents == null || v.priceCents <= 0,
    );
    if (missingPrice) {
      issues.push({
        id: "no-price",
        message: "Prix manquant ou invalide sur une variante active.",
      });
    }

    const missingSize = activeVariants.some((v) => !hasSizeOrAge(v));
    if (missingSize) {
      issues.push({
        id: "no-size",
        message:
          "Taille ou âge manquant sur une variante active — obligatoire pour les vêtements enfants.",
      });
    }
  }

  const missingWeight = activeVariants.some(
    (v) => !v.weightGrams || v.weightGrams <= 0,
  );
  if (missingWeight) {
    issues.push({
      id: "no-weight",
      message:
        "Poids manquant sur une ou plusieurs variantes actives — nécessaire pour les frais de livraison.",
    });
  }

  const commercialCount = countCommercialStorefrontImages(images);
  if (commercialCount >= 1 && commercialCount < STOREFRONT_READY_TO_SELL_PHOTOS_MIN) {
    issues.push({
      id: "recommended-more-photos",
      message: `Seulement ${commercialCount} photo(s) commerciale(s) — ajoutez ${STOREFRONT_READY_TO_SELL_PHOTOS_MIN} photos (face, matière, couleur fidèle) pour une fiche « prête à vendre ».`,
      blocking: false,
    });
  }

  return issues;
}

export function isReadyToPublish(issues: ProductReadinessIssue[]): boolean {
  return !issues.some((issue) => issue.blocking !== false);
}

export function formatPublishBlockMessage(issues: ProductReadinessIssue[]): string {
  if (issues.length === 0) return "";
  const labels = issues.map((issue) => issue.message).join(" ");
  return `Publication impossible : ${labels}`;
}

export function mapVariantsToReadiness(
  variants: Array<{
    stockQuantity: number;
    weightGrams: number | null;
    isActive: boolean;
    priceCents?: number;
    sizeLabel?: string | null;
    ageLabel?: string | null;
  }>,
): ProductReadinessVariant[] {
  return variants.map((variant) => ({
    stockQuantity: variant.stockQuantity,
    weightGrams: variant.weightGrams,
    isActive: variant.isActive,
    priceCents: variant.priceCents,
    sizeLabel: variant.sizeLabel,
    ageLabel: variant.ageLabel,
  }));
}

export function mapImagesToReadiness(
  images: Array<{
    url: string;
    alt?: string | null;
    sortOrder?: number;
    width?: number | null;
    height?: number | null;
  }>,
): ProductReadinessImage[] {
  return images.map((image) => ({
    url: image.url,
    alt: image.alt,
    sortOrder: image.sortOrder,
    width: image.width,
    height: image.height,
  }));
}
