import type { CartLineItem, CartValidationResult } from "@/lib/cart/types";

export async function validateCartOnClient(
  items: CartLineItem[],
): Promise<CartValidationResult | null> {
  if (items.length === 0) {
    return {
      valid: true,
      items: [],
      messages: [],
      subtotalCents: 0,
      shippingCents: 0,
      totalCents: 0,
    };
  }

  try {
    const response = await fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CartValidationResult;
  } catch {
    return null;
  }
}
