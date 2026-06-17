import { describe, expect, it } from "vitest";

import { getCatalogSellReadinessSummary } from "@/lib/admin/catalog-sell-readiness";

describe("catalog-sell-readiness", () => {
  it("considère le catalogue prêt sans démo active et avec produits réels complets", () => {
    const summary = getCatalogSellReadinessSummary({
      activeDevSeedProductCount: 0,
      activeRealProductCount: 3,
      activeProductsWithReadinessIssues: 0,
      activeProductsWithLegacyDemoImages: 0,
      draftProductsReadyToPublish: 2,
    });
    expect(summary.isReadyToSell).toBe(true);
  });

  it("bloque tant qu'un produit démo est actif", () => {
    const summary = getCatalogSellReadinessSummary({
      activeDevSeedProductCount: 2,
      activeRealProductCount: 5,
      activeProductsWithReadinessIssues: 0,
      activeProductsWithLegacyDemoImages: 0,
      draftProductsReadyToPublish: 0,
    });
    expect(summary.isReadyToSell).toBe(false);
    expect(summary.missingRequired.some((item) => item.id === "no-demo-active")).toBe(
      true,
    );
  });

  it("bloque si des produits actifs sont incomplets", () => {
    const summary = getCatalogSellReadinessSummary({
      activeDevSeedProductCount: 0,
      activeRealProductCount: 1,
      activeProductsWithReadinessIssues: 1,
      activeProductsWithLegacyDemoImages: 0,
      draftProductsReadyToPublish: 0,
    });
    expect(summary.isReadyToSell).toBe(false);
    expect(summary.missingRequired.some((item) => item.id === "active-complete")).toBe(
      true,
    );
  });

  it("bloque si des produits actifs utilisent encore des SVG démo", () => {
    const summary = getCatalogSellReadinessSummary({
      activeDevSeedProductCount: 0,
      activeRealProductCount: 2,
      activeProductsWithReadinessIssues: 0,
      activeProductsWithLegacyDemoImages: 3,
      draftProductsReadyToPublish: 0,
    });
    expect(summary.isReadyToSell).toBe(false);
    expect(
      summary.missingRequired.some((item) => item.id === "no-legacy-demo-images"),
    ).toBe(true);
  });
});
