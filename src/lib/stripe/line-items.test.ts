import { describe, expect, it } from "vitest";

import { buildStripeCheckoutLineItems } from "@/lib/stripe/line-items";
import type { Database } from "@/types/database";

type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

function makeItem(
  partial: Partial<OrderItemRow> & Pick<OrderItemRow, "total_price_cents" | "unit_price_cents" | "quantity">,
): OrderItemRow {
  return {
    id: "item-1",
    order_id: "order-1",
    product_id: "prod-1",
    variant_id: "var-1",
    product_name: "Body coton",
    sku: "SKU-1",
    size_label: "6M",
    age_label: null,
    created_at: new Date().toISOString(),
    ...partial,
  };
}

describe("buildStripeCheckoutLineItems", () => {
  it("répartit la remise bundle sur les articles", () => {
    const orderItems = [
      makeItem({ id: "a", total_price_cents: 2500, unit_price_cents: 2500, quantity: 1 }),
      makeItem({ id: "b", total_price_cents: 2500, unit_price_cents: 2500, quantity: 1 }),
      makeItem({ id: "c", total_price_cents: 2500, unit_price_cents: 2500, quantity: 1 }),
      makeItem({ id: "d", total_price_cents: 2500, unit_price_cents: 2500, quantity: 1 }),
    ];

    const lines = buildStripeCheckoutLineItems({
      orderItems,
      shippingCents: 490,
      discountCents: 500,
      expectedTotalCents: 10_000 - 500 + 490,
    });

    const productTotal = lines
      .slice(0, 4)
      .reduce(
        (sum, line) =>
          sum + (line.price_data?.unit_amount ?? 0) * (line.quantity ?? 0),
        0,
      );

    expect(productTotal).toBe(9_500);
    expect(lines).toHaveLength(5);
  });
});
