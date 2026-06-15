import { computeShippingCents as shippingFromItems } from "@/lib/cart/shipping";
import type { CartLineItem } from "@/lib/cart/types";

export { computeShippingCents } from "@/lib/cart/shipping";

export function computeSubtotalCents(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
}

export function computeTotalCents(items: CartLineItem[]): number {
  return computeSubtotalCents(items) + shippingFromItems(items);
}

export function computeItemCount(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getLineStockIssue(
  item: CartLineItem,
): CartLineItem["variantId"] | null {
  if (item.stockQuantity <= 0) return item.variantId;
  if (item.quantity > item.stockQuantity) return item.variantId;
  return null;
}

export function hasStockIssues(items: CartLineItem[]): boolean {
  return items.some((item) => getLineStockIssue(item) !== null);
}
