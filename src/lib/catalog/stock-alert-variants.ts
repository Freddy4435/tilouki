interface VariantLike {
  id: string;
  sizeLabel: string | null;
  ageLabel: string | null;
  stockQuantity: number;
  color?: string | null;
  sku?: string;
}

export interface StockAlertVariantOption {
  id: string;
  label: string;
}

function variantLabel(variant: VariantLike): string {
  return (
    variant.sizeLabel?.trim() ||
    variant.ageLabel?.trim() ||
    variant.color?.trim() ||
    variant.sku?.trim() ||
    "Taille"
  );
}

export function listOutOfStockVariantOptions(
  variants: VariantLike[],
): StockAlertVariantOption[] {
  return variants
    .filter((variant) => variant.stockQuantity <= 0)
    .map((variant) => ({
      id: variant.id,
      label: variantLabel(variant),
    }));
}

/** Variantes en rupture depuis les quick-add (favoris / cartes). */
export function listOutOfStockQuickAddOptions(
  variants: Array<{
    id: string;
    sizeLabel: string | null;
    ageLabel: string | null;
    stockQuantity: number;
  }>,
): StockAlertVariantOption[] {
  return listOutOfStockVariantOptions(variants);
}
