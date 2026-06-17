import type { CartLineInput } from "@/lib/cart/types";
import type { ProductListItem, ProductQuickAddVariant } from "@/types/catalog";

export function pickCapsuleDefaultVariant(
  product: ProductListItem,
): ProductQuickAddVariant | null {
  const variants = product.quickAddVariants ?? [];
  return variants.find((variant) => variant.stockQuantity > 0) ?? null;
}

export function buildCapsuleCartLines(products: ProductListItem[]): CartLineInput[] {
  const lines: CartLineInput[] = [];

  for (const product of products) {
    const variant = pickCapsuleDefaultVariant(product);
    if (!variant) continue;

    lines.push({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      sizeLabel: variant.sizeLabel,
      ageLabel: variant.ageLabel,
      sku: variant.sku,
      unitPriceCents: variant.priceCents,
      image: product.primaryImageUrl,
      stockQuantity: variant.stockQuantity,
      weightGrams: variant.weightGrams,
    });
  }

  return lines;
}

export interface CapsuleAddToCartSummary {
  addedCount: number;
  skippedCount: number;
  totalCents: number;
}

export function summarizeCapsuleAddToCart(
  products: ProductListItem[],
  lines: CartLineInput[],
): CapsuleAddToCartSummary {
  const addedCount = lines.length;
  const skippedCount = Math.max(0, products.length - addedCount);
  const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents, 0);
  return { addedCount, skippedCount, totalCents };
}
