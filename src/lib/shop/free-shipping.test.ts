import { describe, expect, it } from "vitest";

import {
  computeFreeShippingProgress,
  resolveFreeShippingThresholdCents,
} from "@/lib/shop/free-shipping";

describe("free-shipping", () => {
  it("calcule la progression vers le seuil", () => {
    const progress = computeFreeShippingProgress(5_000, 8_000);
    expect(progress.remainingCents).toBe(3_000);
    expect(progress.progressPercent).toBe(63);
    expect(progress.qualified).toBe(false);
  });

  it("marque qualifié au-delà du seuil", () => {
    const progress = computeFreeShippingProgress(9_000, 8_000);
    expect(progress.qualified).toBe(true);
    expect(progress.remainingCents).toBe(0);
    expect(progress.progressPercent).toBe(100);
  });

  it("désactive le seuil via env off", () => {
    const previous = process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS;
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS = "off";
    expect(resolveFreeShippingThresholdCents()).toBeNull();
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS = previous;
  });
});
