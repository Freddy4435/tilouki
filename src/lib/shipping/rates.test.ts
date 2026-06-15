import { describe, expect, it } from "vitest";

import {
  calculateRelayShippingCents,
  calculateShippingRate,
  computeCartWeightGrams,
  computeShippingCents,
  DEFAULT_CHRONOPOST_RATES,
  DEFAULT_ITEM_WEIGHT_GRAMS,
  DEFAULT_SHIPPING_RATES,
  getDefaultRatesForCarrier,
} from "@/lib/shipping/rates";

describe("computeCartWeightGrams", () => {
  it("multiplie le poids par la quantité", () => {
    const weight = computeCartWeightGrams([
      { weightGrams: 200, quantity: 2 },
      { weightGrams: 100, quantity: 1 },
    ]);

    expect(weight).toBe(500);
  });

  it("utilise le poids par défaut si non renseigné", () => {
    const weight = computeCartWeightGrams([{ weightGrams: null, quantity: 2 }]);

    expect(weight).toBe(DEFAULT_ITEM_WEIGHT_GRAMS * 2);
  });
});

describe("calculateShippingRate", () => {
  it("retourne 0 € de livraison pour un poids nul", () => {
    const result = calculateShippingRate(0);

    expect(result.priceCents).toBe(0);
    expect(result.totalWeightGrams).toBe(0);
    expect(result.rate.label).toBe(DEFAULT_SHIPPING_RATES[0]!.label);
  });

  it.each([
    [100, 390],
    [250, 390],
    [251, 490],
    [500, 490],
    [501, 590],
    [1_000, 590],
    [1_001, 690],
    [2_000, 690],
    [2_001, 890],
    [3_000, 890],
  ])("applique la tranche %i g → %i centimes", (grams, expectedCents) => {
    expect(calculateShippingRate(grams).priceCents).toBe(expectedCents);
  });

  it("utilise la dernière tranche au-delà du barème", () => {
    const result = calculateShippingRate(5_000);

    expect(result.priceCents).toBe(890);
    expect(result.rate.maxWeightGrams).toBe(3_000);
  });

  it("applique un barème personnalisé (comme après édition admin)", () => {
    const adminRates = [
      {
        label: "0 – 500 g",
        minWeightGrams: 0,
        maxWeightGrams: 500,
        priceCents: 599,
        sortOrder: 1,
      },
      {
        label: "501 g – 2 kg",
        minWeightGrams: 501,
        maxWeightGrams: 2_000,
        priceCents: 799,
        sortOrder: 2,
      },
    ];

    expect(calculateShippingRate(400, adminRates).priceCents).toBe(599);
    expect(calculateShippingRate(800, adminRates).priceCents).toBe(799);
  });
});

describe("calcul des frais par transporteur", () => {
  it("retourne le barème du transporteur demandé", () => {
    expect(getDefaultRatesForCarrier("mondial_relay")).toBe(DEFAULT_SHIPPING_RATES);
    expect(getDefaultRatesForCarrier("chronopost")).toBe(DEFAULT_CHRONOPOST_RATES);
  });

  it.each([
    [100, 490],
    [500, 590],
    [1_000, 690],
    [2_000, 850],
    [3_000, 1_050],
  ])("applique la tranche Chronopost %i g → %i centimes", (grams, expectedCents) => {
    expect(calculateShippingRate(grams, DEFAULT_CHRONOPOST_RATES).priceCents).toBe(
      expectedCents,
    );
  });

  it("produit des frais différents entre transporteurs pour un même panier", () => {
    const items = [{ weightGrams: 200, quantity: 2 }];

    const mrCents = computeShippingCents(items, DEFAULT_SHIPPING_RATES);
    const chronoCents = computeShippingCents(items, DEFAULT_CHRONOPOST_RATES);

    expect(mrCents).toBe(490);
    expect(chronoCents).toBe(590);
  });
});

describe("calculateRelayShippingCents / computeShippingCents", () => {
  it("calcule les frais à partir du poids total", () => {
    expect(calculateRelayShippingCents(300)).toBe(490);
  });

  it("retourne 0 pour un panier vide", () => {
    expect(computeShippingCents([])).toBe(0);
  });

  it("agrège poids et barème pour des lignes panier", () => {
    const shipping = computeShippingCents([{ weightGrams: 120, quantity: 2 }]);

    expect(shipping).toBe(390);
  });
});
