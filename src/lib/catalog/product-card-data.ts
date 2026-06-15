import { isProductStorefrontListed } from "@/lib/catalog/product-sellability";
import type {
  ProductCardColorOption,
  ProductListItem,
  ProductQuickAddVariant,
  ProductVariant,
} from "@/types/catalog";

interface SortableImage {
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface VariantColorSource {
  color: string | null;
  isActive?: boolean;
}

export interface SecondaryImage {
  url: string | null;
  alt: string | null;
}

export type QuickAddMode = "none" | "direct" | "picker";

export interface QuickAddResolution {
  mode: QuickAddMode;
  directVariant?: ProductQuickAddVariant;
}

const MAX_VISIBLE_COLORS = 4;

export function deriveSecondaryImage(images: SortableImage[]): SecondaryImage {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  if (sorted.length < 2) {
    return { url: null, alt: null };
  }

  const secondary = sorted[1]!;
  return {
    url: secondary.url,
    alt: secondary.alt,
  };
}

export function deriveDistinctColors(variants: VariantColorSource[]): string[] {
  const colors = variants
    .filter((variant) => variant.isActive !== false)
    .map((variant) => variant.color?.trim())
    .filter((color): color is string => Boolean(color));

  return [...new Set(colors)];
}

export function findImageForColor(
  images: SortableImage[],
  color: string,
  colorIndex: number,
): string | null {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  if (sorted.length === 0) return null;

  const needle = normalizeColorKey(color);
  const byAlt = sorted.find((image) => {
    const alt = image.alt?.trim().toLowerCase();
    return alt
      ? normalizeColorKey(alt).includes(needle) ||
          needle.includes(normalizeColorKey(alt))
      : false;
  });
  if (byAlt) return byAlt.url;

  const imageIndex = colorIndex + 1;
  if (imageIndex < sorted.length) return sorted[imageIndex]!.url;
  return sorted[0]!.url;
}

export function deriveColorOptions(
  variants: VariantColorSource[],
  images: SortableImage[],
): ProductCardColorOption[] {
  const colors = deriveDistinctColors(variants);
  if (colors.length < 2) return [];

  return colors.map((color, index) => ({
    color,
    imageUrl: findImageForColor(images, color, index),
  }));
}

export function deriveQuickAddVariants(
  variants: ProductVariant[],
): ProductQuickAddVariant[] {
  return variants
    .filter((variant) => variant.isActive && variant.stockQuantity > 0)
    .map((variant) => ({
      id: variant.id,
      sizeLabel: variant.sizeLabel,
      ageLabel: variant.ageLabel,
      color: variant.color,
      priceCents: variant.priceCents,
      stockQuantity: variant.stockQuantity,
      sku: variant.sku,
      weightGrams: variant.weightGrams,
    }));
}

export function getVisibleColorOptions(
  options: ProductCardColorOption[],
  max = MAX_VISIBLE_COLORS,
): { visible: ProductCardColorOption[]; overflow: number } {
  if (options.length <= max) {
    return { visible: options, overflow: 0 };
  }

  return {
    visible: options.slice(0, max),
    overflow: options.length - max,
  };
}

export function resolveQuickAddMode(
  variants: ProductQuickAddVariant[],
): QuickAddResolution {
  if (variants.length === 0) return { mode: "none" };
  if (variants.length === 1) return { mode: "direct", directVariant: variants[0] };
  return { mode: "picker" };
}

export function formatQuickAddVariantLabel(variant: ProductQuickAddVariant): string {
  const parts = [variant.sizeLabel, variant.ageLabel, variant.color].filter(Boolean);
  return parts.join(" · ") || variant.sku;
}

export function shouldShowSecondaryImage(
  secondaryImageUrl: string | null | undefined,
  activePrimaryUrl: string | null | undefined,
): boolean {
  return Boolean(
    secondaryImageUrl && activePrimaryUrl && secondaryImageUrl !== activePrimaryUrl,
  );
}

/** Ajout rapide catalogue : une seule taille en stock + fiche vendable. */
export function canShowProductCardQuickAdd(params: {
  quickAddVariants: ProductQuickAddVariant[];
  inStock: boolean;
  isStorefrontSellable: boolean;
}): boolean {
  if (!params.inStock || !params.isStorefrontSellable) return false;
  return resolveQuickAddMode(params.quickAddVariants).mode === "direct";
}

function normalizeColorKey(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Désactive l'ajout rapide catalogue pour les fiches non listées (démo, test, sans photo).
 */
export function applyStorefrontListItemGuards(item: ProductListItem): ProductListItem {
  if (isProductStorefrontListed(item)) return item;
  return {
    ...item,
    quickAddVariants: [],
  };
}

/** Met les fiches vendables en tête (sécurité si des items non listés passent le filtre requête). */
export function sortStorefrontListedFirst(
  products: ProductListItem[],
): ProductListItem[] {
  return [...products].sort((left, right) => {
    const leftListed = isProductStorefrontListed(left) ? 0 : 1;
    const rightListed = isProductStorefrontListed(right) ? 0 : 1;
    if (leftListed !== rightListed) return leftListed - rightListed;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}
