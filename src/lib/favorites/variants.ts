import type { ProductListItem } from "@/types/catalog";

export interface FavoriteVariantAvailability {
  available: string[];
  outOfStock: string[];
}

function variantLabel(sizeLabel: string | null, ageLabel: string | null): string | null {
  const label = sizeLabel?.trim() || ageLabel?.trim();
  return label || null;
}

/** Répartit les tailles en stock / rupture pour la page favoris. */
export function resolveFavoriteVariantAvailability(
  product: Pick<ProductListItem, "sizes" | "quickAddVariants" | "totalStock">,
): FavoriteVariantAvailability {
  const variants = product.quickAddVariants ?? [];

  if (variants.length > 0) {
    const available: string[] = [];
    const outOfStock: string[] = [];

    for (const variant of variants) {
      const label = variantLabel(variant.sizeLabel, variant.ageLabel);
      if (!label) continue;

      if (variant.stockQuantity > 0) {
        if (!available.includes(label)) available.push(label);
      } else if (!outOfStock.includes(label)) {
        outOfStock.push(label);
      }
    }

    return { available, outOfStock };
  }

  if ((product.totalStock ?? 0) <= 0) {
    return { available: [], outOfStock: [...product.sizes] };
  }

  return { available: [...product.sizes], outOfStock: [] };
}
