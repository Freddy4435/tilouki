export interface CartLineItem {
  productId: string;
  variantId: string;
  productName: string;
  slug: string;
  image: string | null;
  sizeLabel: string | null;
  ageLabel: string | null;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  stockQuantity: number;
  weightGrams: number | null;
}

export type CartLineInput = Omit<CartLineItem, "quantity">;

export type CartStockIssue = "out_of_stock" | "insufficient_stock" | "unavailable";

export interface CartValidationLine {
  variantId: string;
  stockQuantity: number;
  unitPriceCents: number;
  isAvailable: boolean;
  requestedQuantity: number;
  adjustedQuantity: number;
  issue?: CartStockIssue;
}

export interface CartValidationResult {
  valid: boolean;
  items: CartValidationLine[];
  messages: string[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}
