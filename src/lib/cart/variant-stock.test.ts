import { describe, expect, it } from "vitest";

import { evaluateCartLineStock } from "@/lib/cart/variant-stock";

describe("evaluateCartLineStock", () => {
  it("autorise la commande d'une unité quand le stock est à 1", () => {
    const result = evaluateCartLineStock({ isActive: true, stockQuantity: 1 }, 1);
    expect(result.issue).toBeUndefined();
    expect(result.adjustedQuantity).toBe(1);
    expect(result.isAvailable).toBe(true);
  });

  it("bloque une variante inactive même avec stock positif", () => {
    const result = evaluateCartLineStock({ isActive: false, stockQuantity: 5 }, 1);
    expect(result.issue).toBe("unavailable");
    expect(result.adjustedQuantity).toBe(0);
    expect(result.isAvailable).toBe(false);
  });

  it("signale un stock insuffisant au-delà de la quantité disponible", () => {
    const result = evaluateCartLineStock({ isActive: true, stockQuantity: 1 }, 2);
    expect(result.issue).toBe("insufficient_stock");
    expect(result.adjustedQuantity).toBe(1);
  });

  it("refuse une variante active en rupture", () => {
    const result = evaluateCartLineStock({ isActive: true, stockQuantity: 0 }, 1);
    expect(result.issue).toBe("out_of_stock");
    expect(result.isAvailable).toBe(false);
  });
});
