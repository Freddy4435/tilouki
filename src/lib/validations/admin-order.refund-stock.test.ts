import { describe, expect, it } from "vitest";

import { adminOrderRefundSchema, adminStockAdjustSchema } from "@/lib/validations/admin-order";

describe("adminOrderRefundSchema", () => {
  it("accepte un remboursement intégral", () => {
    const result = adminOrderRefundSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
      mode: "full",
    });
    expect(result.success).toBe(true);
  });

  it("exige un montant pour le partiel", () => {
    const result = adminOrderRefundSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440001",
      mode: "partial",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminStockAdjustSchema", () => {
  it("refuse un delta nul", () => {
    const result = adminStockAdjustSchema.safeParse({
      variantId: "550e8400-e29b-41d4-a716-446655440002",
      delta: 0,
      note: "inventaire",
    });
    expect(result.success).toBe(false);
  });
});
