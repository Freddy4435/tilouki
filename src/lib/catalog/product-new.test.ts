import { describe, expect, it } from "vitest";

import { isProductNew } from "@/lib/catalog/product-new";

describe("isProductNew", () => {
  it("retourne true pour un produit créé il y a moins de 21 jours", () => {
    const recent = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(isProductNew(recent)).toBe(true);
  });

  it("retourne false pour un produit ancien", () => {
    const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(isProductNew(old)).toBe(false);
  });
});
