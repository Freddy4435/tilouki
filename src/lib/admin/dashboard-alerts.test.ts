import { describe, expect, it } from "vitest";

import {
  buildAdminConfigurationAlerts,
  buildAdminDashboardPriorities,
} from "@/lib/admin/dashboard-alerts";

const completeLegal = {
  shopName: "Tilouki",
  legalName: "Test",
  legalStatus: "AE",
  siret: "12345678901234",
  address: "1 rue Test",
  email: "a@b.fr",
  phone: "0600000000",
  hostName: "Vercel",
  hostAddress: "US",
  hostEmail: "h@vercel.com",
  mediationName: "Med",
  mediationUrl: "https://med.fr",
  returnPolicy: "Retours sous 14 jours.",
};

function baseContext(
  overrides: Partial<Parameters<typeof buildAdminConfigurationAlerts>[0]> = {},
) {
  return {
    legalSettings: completeLegal,
    activeProductCount: 5,
    productsWithoutPhotoCount: 0,
    productsWithoutStockCount: 0,
    productsWithoutWeightCount: 0,
    storageConfigured: true,
    stripeConfigured: true,
    adminEmailConfigured: true,
    transactionEmailConfigured: true,
    mondialRelayConfigured: true,
    chronopostConfigured: true,
    devMockShipping: false,
    activeDevSeedProductCount: 0,
    ...overrides,
  };
}

describe("buildAdminConfigurationAlerts", () => {
  it("retourne une alerte quand aucun produit actif", () => {
    const alerts = buildAdminConfigurationAlerts(
      baseContext({ activeProductCount: 0 }),
    );

    expect(alerts.some((a) => a.id === "no-active-products")).toBe(true);
  });

  it("alerte critique quand des produits démo sont encore actifs", () => {
    const alerts = buildAdminConfigurationAlerts(
      baseContext({ activeDevSeedProductCount: 3 }),
    );

    const demo = alerts.find((a) => a.id === "demo-products");
    expect(demo?.severity).toBe("critical");
    expect(demo?.title).toContain("démonstration");
    expect(demo?.href).toBe("/admin/produits?demo=1");
    expect(demo?.actions?.[0]?.action).toBe("deactivate-demo-products");
  });

  it("signale Chronopost non configuré quand MR est actif", () => {
    const alerts = buildAdminConfigurationAlerts(
      baseContext({ chronopostConfigured: false }),
    );

    const chrono = alerts.find((a) => a.id === "chronopost");
    expect(chrono?.severity).toBe("warning");
    expect(chrono?.description).toContain("Seul Mondial Relay");
    expect(chrono?.href).toBe("/admin/livraison");
  });

  it("signale Stripe, stockage et produits incomplets", () => {
    const alerts = buildAdminConfigurationAlerts(
      baseContext({
        legalSettings: null,
        stripeConfigured: false,
        storageConfigured: false,
        productsWithoutPhotoCount: 2,
        productsWithoutStockCount: 1,
        productsWithoutWeightCount: 3,
      }),
    );

    expect(alerts.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        "stripe",
        "storage",
        "legal",
        "products-no-photo",
        "products-no-stock",
        "products-no-weight",
      ]),
    );
  });
});

describe("buildAdminDashboardPriorities", () => {
  it("met les commandes à préparer en tête", () => {
    const priorities = buildAdminDashboardPriorities({
      ordersToPrepare: 4,
      paidNotShippedCount: 4,
      lowStockCount: 0,
      alerts: [],
      activeProductCount: 10,
    });

    expect(priorities[0]?.id).toBe("prepare-orders");
  });
});
