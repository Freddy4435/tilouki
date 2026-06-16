import type { ProductQuickAddVariant } from "@/types/catalog";

export function getProductCardCtaLabel(
  sizes: string[],
  quickAddVariants: ProductQuickAddVariant[],
  inStock: boolean,
): string {
  if (!inStock) return "Voir le produit";

  const variantCount = quickAddVariants.filter(
    (variant) => variant.stockQuantity > 0,
  ).length;
  const needsSizeChoice = sizes.length > 1 || variantCount > 1;

  return needsSizeChoice ? "Voir les tailles" : "Voir le produit";
}
