import { describe, expect, it } from "vitest";

import {
  buildProductionReadinessSummary,
  countActiveRealProducts,
  summarizeProductionReadiness,
  type ProductionReadinessInput,
} from "@/lib/admin/production-readiness";

function completeInput(
  overrides: Partial<ProductionReadinessInput> = {},
): ProductionReadinessInput {
  return {
    legalReady: true,
    legalMissingLabels: [],
    activeCategoryCount: 5,
    activeRealProductCount: 12,
    activeDevSeedProductCount: 0,
    legalPagesCheckoutReady: true,
    legalPagesBlockedLabels: [],
    mondialRelayActiveRateCount: 3,
    deployEnvValid: true,
    deployEnvErrors: [],
    deployEnvWarnings: [],
    analyticsEnabled: false,
    pendingReviewCount: 0,
    ...overrides,
  };
}

describe("production-readiness — agrégation", () => {
  it("indique prêt à vendre quand les données boutique sont complètes", () => {
    const summary = buildProductionReadinessSummary(completeInput());
    expect(summary.readyToSell).toBe(true);
    expect(summary.readyToCollect).toBe(true);
    expect(summary.blockingCount).toBe(0);
  });

  it("refuse l'encaissement si verify:deploy:prod échoue", () => {
    const summary = buildProductionReadinessSummary(
      completeInput({
        deployEnvValid: false,
        deployEnvErrors: [
          { id: "STRIPE_SECRET_KEY", message: "STRIPE_SECRET_KEY absent" },
        ],
      }),
    );
    expect(summary.readyToSell).toBe(true);
    expect(summary.readyToCollect).toBe(false);
    expect(summary.deployEnvValid).toBe(false);
  });

  it("bloque la boutique si les pages légales ne sont pas publiables", () => {
    const summary = buildProductionReadinessSummary(
      completeInput({
        legalPagesCheckoutReady: false,
        legalPagesBlockedLabels: ["CGV"],
      }),
    );
    expect(summary.readyToSell).toBe(false);
    expect(summary.readyToCollect).toBe(false);
  });

  it("compte les produits réels actifs hors slugs démo", () => {
    expect(
      countActiveRealProducts([
        { slug: "body-bebe-coton-bio", status: "active" },
        { slug: "body-bebe-coton-naturel", status: "active" },
        { slug: "robe-ete", status: "draft" },
      ]),
    ).toBe(1);
  });
});

describe("summarizeProductionReadiness", () => {
  it("agrège le nombre de bloquants", () => {
    const checks = buildProductionReadinessSummary(
      completeInput({ activeRealProductCount: 0 }),
    ).checks;
    const summary = summarizeProductionReadiness(checks, true);
    expect(summary.readyToSell).toBe(false);
    expect(summary.blockingCount).toBeGreaterThan(0);
  });
});
