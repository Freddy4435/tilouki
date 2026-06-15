import { describe, expect, it } from "vitest";

import {
  adminShippingRateSchema,
  computeReorderUpdates,
  findOverlappingRate,
  mergeRateIntoGrid,
  suggestNextSortOrder,
  validateContinuousRateGrid,
  type RateRange,
} from "@/lib/validations/admin-shipping-rate";

function rate(
  overrides: Partial<RateRange> & Pick<RateRange, "minWeightGrams" | "maxWeightGrams">,
): RateRange {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    label:
      overrides.label ?? `${overrides.minWeightGrams} – ${overrides.maxWeightGrams} g`,
    isActive: overrides.isActive ?? true,
    minWeightGrams: overrides.minWeightGrams,
    maxWeightGrams: overrides.maxWeightGrams,
  };
}

describe("findOverlappingRate", () => {
  const existing: RateRange[] = [
    rate({ id: "a", minWeightGrams: 0, maxWeightGrams: 250 }),
    rate({ id: "b", minWeightGrams: 251, maxWeightGrams: 500 }),
    rate({ id: "c", minWeightGrams: 501, maxWeightGrams: 1000 }),
  ];

  it("accepte une tranche disjointe", () => {
    expect(
      findOverlappingRate({ minWeightGrams: 1001, maxWeightGrams: 2000 }, existing),
    ).toBeNull();
  });

  it("détecte un chevauchement partiel", () => {
    const conflict = findOverlappingRate(
      { minWeightGrams: 400, maxWeightGrams: 600 },
      existing,
    );
    expect(conflict?.id).toBe("b");
  });

  it("détecte une tranche entièrement contenue dans une autre", () => {
    const conflict = findOverlappingRate(
      { minWeightGrams: 300, maxWeightGrams: 400 },
      existing,
    );
    expect(conflict?.id).toBe("b");
  });

  it("détecte une tranche englobant une existante", () => {
    const conflict = findOverlappingRate(
      { minWeightGrams: 0, maxWeightGrams: 5000 },
      existing,
    );
    expect(conflict).not.toBeNull();
  });

  it("détecte le chevauchement sur une borne partagée (bornes inclusives)", () => {
    const conflict = findOverlappingRate(
      { minWeightGrams: 250, maxWeightGrams: 300 },
      existing,
    );
    expect(conflict?.id).toBe("a");
  });

  it("accepte des bornes adjacentes sans recouvrement (251 après 250)", () => {
    expect(
      findOverlappingRate({ minWeightGrams: 1001, maxWeightGrams: 1500 }, existing),
    ).toBeNull();
  });

  it("ignore les tranches inactives", () => {
    const withInactive = [
      ...existing,
      rate({ id: "d", minWeightGrams: 1001, maxWeightGrams: 2000, isActive: false }),
    ];
    expect(
      findOverlappingRate({ minWeightGrams: 1001, maxWeightGrams: 2000 }, withInactive),
    ).toBeNull();
  });

  it("exclut la tranche elle-même lors d'une édition", () => {
    expect(
      findOverlappingRate(
        { id: "b", minWeightGrams: 251, maxWeightGrams: 500 },
        existing,
      ),
    ).toBeNull();
  });

  it("détecte un conflit avec une autre tranche lors d'une édition", () => {
    const conflict = findOverlappingRate(
      { id: "b", minWeightGrams: 200, maxWeightGrams: 500 },
      existing,
    );
    expect(conflict?.id).toBe("a");
  });
});

describe("adminShippingRateSchema", () => {
  const base = {
    provider: "mondial_relay",
    label: "0 – 250 g",
    minWeightGrams: "0",
    maxWeightGrams: "250",
    priceCents: "3,90",
    sortOrder: "1",
    isActive: true,
  };

  it("parse une saisie valide (prix euros avec virgule → cents)", () => {
    const parsed = adminShippingRateSchema.parse(base);
    expect(parsed.priceCents).toBe(390);
    expect(parsed.minWeightGrams).toBe(0);
    expect(parsed.maxWeightGrams).toBe(250);
  });

  it("refuse min ≥ max", () => {
    const result = adminShippingRateSchema.safeParse({
      ...base,
      minWeightGrams: "250",
      maxWeightGrams: "250",
    });
    expect(result.success).toBe(false);
  });

  it("refuse un prix négatif", () => {
    const result = adminShippingRateSchema.safeParse({ ...base, priceCents: "-1" });
    expect(result.success).toBe(false);
  });

  it("refuse un prix nul (0 €)", () => {
    const result = adminShippingRateSchema.safeParse({ ...base, priceCents: "0" });
    expect(result.success).toBe(false);
  });

  it("refuse un provider inconnu", () => {
    const result = adminShippingRateSchema.safeParse({ ...base, provider: "ups" });
    expect(result.success).toBe(false);
  });

  it("refuse un libellé vide", () => {
    const result = adminShippingRateSchema.safeParse({ ...base, label: "  " });
    expect(result.success).toBe(false);
  });

  it("fixe la méthode point relais par défaut", () => {
    const parsed = adminShippingRateSchema.parse(base);
    expect(parsed.shippingMethod).toBe("relay_point");
  });

  it("refuse une méthode inconnue", () => {
    const result = adminShippingRateSchema.safeParse({
      ...base,
      shippingMethod: "home_delivery",
    });
    expect(result.success).toBe(false);
  });
});

describe("computeReorderUpdates", () => {
  const rates = [
    { id: "a", sortOrder: 1 },
    { id: "b", sortOrder: 2 },
    { id: "c", sortOrder: 3 },
  ];

  it("échange sort_order avec la tranche du dessus", () => {
    expect(computeReorderUpdates(rates, "b", "up")).toEqual([
      { id: "b", sortOrder: 1 },
      { id: "a", sortOrder: 2 },
    ]);
  });

  it("échange sort_order avec la tranche du dessous", () => {
    expect(computeReorderUpdates(rates, "b", "down")).toEqual([
      { id: "b", sortOrder: 3 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("refuse de monter la première tranche", () => {
    expect(computeReorderUpdates(rates, "a", "up")).toBeNull();
  });

  it("refuse de descendre la dernière tranche", () => {
    expect(computeReorderUpdates(rates, "c", "down")).toBeNull();
  });
});

describe("validateContinuousRateGrid", () => {
  const continuous: RateRange[] = [
    rate({ id: "a", minWeightGrams: 0, maxWeightGrams: 250 }),
    rate({ id: "b", minWeightGrams: 251, maxWeightGrams: 500 }),
    rate({ id: "c", minWeightGrams: 501, maxWeightGrams: 1000 }),
  ];

  it("accepte une grille continue depuis 0 g", () => {
    expect(validateContinuousRateGrid(continuous)).toBeNull();
  });

  it("refuse si la grille ne commence pas à 0 g", () => {
    expect(
      validateContinuousRateGrid([rate({ minWeightGrams: 100, maxWeightGrams: 500 })]),
    ).toContain("0 g");
  });

  it("refuse un trou entre deux tranches", () => {
    expect(
      validateContinuousRateGrid([
        rate({ minWeightGrams: 0, maxWeightGrams: 250 }),
        rate({ minWeightGrams: 400, maxWeightGrams: 1000 }),
      ]),
    ).toContain("Trou");
  });

  it("ignore les tranches inactives", () => {
    expect(
      validateContinuousRateGrid([
        ...continuous,
        rate({ minWeightGrams: 1001, maxWeightGrams: 2000, isActive: false }),
      ]),
    ).toBeNull();
  });
});

describe("mergeRateIntoGrid", () => {
  const existing: RateRange[] = [
    rate({ id: "a", minWeightGrams: 0, maxWeightGrams: 250 }),
    rate({ id: "b", minWeightGrams: 251, maxWeightGrams: 500 }),
  ];

  it("remplace une tranche existante lors d'une édition", () => {
    const merged = mergeRateIntoGrid(existing, {
      id: "b",
      label: "251 – 600 g",
      minWeightGrams: 251,
      maxWeightGrams: 600,
      isActive: true,
    });
    expect(merged.find((r) => r.id === "b")?.maxWeightGrams).toBe(600);
    expect(merged).toHaveLength(2);
  });

  it("ajoute une nouvelle tranche active", () => {
    const merged = mergeRateIntoGrid(existing, {
      label: "501 – 1000 g",
      minWeightGrams: 501,
      maxWeightGrams: 1000,
      isActive: true,
    });
    expect(merged).toHaveLength(3);
  });
});

describe("suggestNextSortOrder", () => {
  it("retourne 1 pour une liste vide", () => {
    expect(suggestNextSortOrder([])).toBe(1);
  });

  it("propose max + 1", () => {
    expect(
      suggestNextSortOrder([
        { id: "a", sortOrder: 2 },
        { id: "b", sortOrder: 5 },
      ]),
    ).toBe(6);
  });
});
