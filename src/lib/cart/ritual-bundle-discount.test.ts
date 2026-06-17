import { describe, expect, it } from "vitest";

import { computeRitualBundleDiscount } from "@/lib/cart/ritual-bundle-discount";

describe("ritual-bundle-discount", () => {
  it("n'applique pas la remise sous le seuil d'articles", () => {
    const result = computeRitualBundleDiscount(10_000, 3);
    expect(result.applied).toBe(false);
    expect(result.discountCents).toBe(0);
  });

  it("applique 5 % à partir de 4 articles", () => {
    const result = computeRitualBundleDiscount(10_000, 4);
    expect(result.applied).toBe(true);
    expect(result.discountCents).toBe(500);
    expect(result.label).toContain("5");
  });
});
