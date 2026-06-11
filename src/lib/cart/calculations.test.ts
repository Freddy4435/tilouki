import { describe, expect, it } from "vitest";

import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";
import {
  computeItemCount,
  computeSubtotalCents,
  computeTotalCents,
  getLineStockIssue,
  hasStockIssues,
} from "@/lib/cart/calculations";
import type { CartLineItem } from "@/lib/cart/types";

function line(overrides: Partial<CartLineItem> = {}): CartLineItem {
  return {
    productId: "prod-1",
    variantId: "var-1",
    productName: "Robe fleurie",
    slug: "robe-fleurie",
    image: null,
    sizeLabel: "6 ans",
    ageLabel: null,
    sku: "ROBE-6A",
    unitPriceCents: 2_500,
    quantity: 1,
    stockQuantity: 5,
    weightGrams: 120,
    ...overrides,
  };
}

describe("computeSubtotalCents", () => {
  it("additionne prix × quantité pour chaque ligne", () => {
    const items = [
      line({ unitPriceCents: 1_500, quantity: 2 }),
      line({ variantId: "var-2", unitPriceCents: 800, quantity: 1 }),
    ];

    expect(computeSubtotalCents(items)).toBe(3_800);
  });

  it("retourne 0 pour un panier vide", () => {
    expect(computeSubtotalCents([])).toBe(0);
  });
});

describe("computeTotalCents", () => {
  it("inclut les frais de livraison au sous-total", () => {
    const items = [line({ unitPriceCents: 1_000, quantity: 1, weightGrams: 120 })];

    expect(computeTotalCents(items)).toBe(1_000 + 390);
  });

  it("ne facture pas de livraison sur un panier vide", () => {
    expect(computeTotalCents([])).toBe(0);
  });
});

describe("computeItemCount", () => {
  it("compte le nombre total d'articles (somme des quantités)", () => {
    const items = [
      line({ quantity: 2 }),
      line({ variantId: "var-2", quantity: 3 }),
    ];

    expect(computeItemCount(items)).toBe(5);
  });
});

describe("getLineStockIssue / hasStockIssues", () => {
  it("signale une rupture de stock", () => {
    const item = line({ stockQuantity: 0, quantity: 1 });

    expect(getLineStockIssue(item)).toBe("var-1");
    expect(hasStockIssues([item])).toBe(true);
  });

  it("signale un stock insuffisant", () => {
    const item = line({ stockQuantity: 2, quantity: 5 });

    expect(getLineStockIssue(item)).toBe("var-1");
    expect(hasStockIssues([item])).toBe(true);
  });

  it("ne signale rien quand le stock est suffisant", () => {
    const item = line({ stockQuantity: 10, quantity: 2 });

    expect(getLineStockIssue(item)).toBeNull();
    expect(hasStockIssues([item])).toBe(false);
  });
});

describe("panier avec produit demo seed", () => {
  it("calcule un total commandable (sous-total + livraison) pour un article demo", () => {
    const demoSlug = DEV_SEED_PRODUCT_SLUGS[0];
    const items = [
      line({
        slug: demoSlug,
        productName: "Body bébé coton naturel",
        sku: "DEV-BODY-BEBE-3M",
        unitPriceCents: 1290,
        quantity: 1,
        weightGrams: 150,
        stockQuantity: 12,
      }),
    ];

    expect(computeSubtotalCents(items)).toBe(1290);
    expect(computeTotalCents(items)).toBe(1290 + 390);
    expect(computeItemCount(items)).toBe(1);
    expect(hasStockIssues(items)).toBe(false);
  });
});
