import { describe, expect, it } from "vitest";

import {
  computeRatingDistribution,
  computeRatingSummary,
  roundRatingAverage,
} from "@/lib/reviews/ratings";

describe("computeRatingSummary", () => {
  it("calcule la moyenne et la distribution", () => {
    const summary = computeRatingSummary([5, 4, 4, 3]);
    expect(summary).toEqual({
      average: 4,
      count: 4,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 1 },
    });
  });

  it("retourne null sans avis", () => {
    expect(computeRatingSummary([])).toBeNull();
  });

  it("arrondit la moyenne à une décimale", () => {
    expect(roundRatingAverage(4.26)).toBe(4.3);
    expect(computeRatingDistribution([5, 4])[5]).toBe(1);
  });
});
