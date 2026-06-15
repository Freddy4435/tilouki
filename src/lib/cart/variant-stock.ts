import type { CartStockIssue } from "@/lib/cart/types";

export interface VariantStockRow {
  isActive: boolean;
  stockQuantity: number;
}

export interface CartLineStockEvaluation {
  issue?: CartStockIssue;
  adjustedQuantity: number;
  isAvailable: boolean;
}

/** Évalue la disponibilité d'une ligne panier (logique pure, testable). */
export function evaluateCartLineStock(
  variant: VariantStockRow,
  requestedQuantity: number,
): CartLineStockEvaluation {
  if (!variant.isActive) {
    return { issue: "unavailable", adjustedQuantity: 0, isAvailable: false };
  }

  if (variant.stockQuantity <= 0) {
    return { issue: "out_of_stock", adjustedQuantity: 0, isAvailable: false };
  }

  if (requestedQuantity > variant.stockQuantity) {
    return {
      issue: "insufficient_stock",
      adjustedQuantity: variant.stockQuantity,
      isAvailable: true,
    };
  }

  return {
    adjustedQuantity: requestedQuantity,
    isAvailable: true,
  };
}
