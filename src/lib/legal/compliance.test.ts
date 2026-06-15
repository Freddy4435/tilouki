import { describe, expect, it } from "vitest";

import {
  buildLegalComplianceItems,
  getLegalComplianceAction,
  getLegalComplianceSummary,
} from "@/lib/legal/compliance";

const completeShopFields = {
  shopName: "Tilouki",
  legalName: "Marie Dupont",
  legalStatus: "Auto-entrepreneur",
  siret: "12345678901234",
  address: "1 rue Test, 75001 Paris",
  email: "contact@tilouki.fr",
  phone: "0600000000",
  vatEnabled: false,
  mediationName: "Médiateur Test",
  mediationUrl: "https://mediateur.example.fr",
  hostName: "Vercel Inc.",
  hostAddress: "440 N Barranca Ave, Covina, CA",
  hostEmail: "support@vercel.com",
  returnPolicy: "Retours sous 14 jours.",
};

const completeLegalPages = [
  { slug: "mentions-legales", content: "<p>Mentions légales complètes Tilouki</p>" },
  { slug: "cgv", content: "<p>CGV complètes avec garanties légales</p>" },
  {
    slug: "confidentialite",
    content: "<p>Politique de confidentialité RGPD complète</p>",
  },
  { slug: "cookies", content: "<p>Politique cookies sans traceur analytics</p>" },
  {
    slug: "livraison-retours",
    content: "<p>Livraison Mondial Relay et retours détaillés</p>",
  },
  {
    slug: "formulaire-retractation",
    content: "<p>Formulaire de rétractation personnalisé</p>",
  },
];

describe("legal compliance checklist", () => {
  it("signale les champs identité vendeur manquants", () => {
    const summary = getLegalComplianceSummary(
      { ...completeShopFields, siret: null },
      { includeInfrastructure: false },
    );
    expect(summary.isComplete).toBe(false);
    expect(summary.missingRequired.some((item) => item.id === "siret")).toBe(true);
  });

  it("exige la mention TVA si assujetti", () => {
    const summary = getLegalComplianceSummary(
      { ...completeShopFields, vatEnabled: true, vatNotice: null },
      { includeInfrastructure: false },
    );
    expect(summary.missingRequired.some((item) => item.id === "vatNotice")).toBe(true);
  });

  it("inclut les pages légales et le barème livraison quand fournis", () => {
    const items = buildLegalComplianceItems(
      {
        ...completeShopFields,
        legalPages: completeLegalPages,
        activeShippingRateCount: 2,
      },
      { includeInfrastructure: false },
    );
    expect(items.some((item) => item.id === "legal-page-cgv")).toBe(true);
    expect(items.some((item) => item.id === "activeShippingRates" && item.filled)).toBe(
      true,
    );
  });

  it("bloque si une page légale est encore en placeholder", () => {
    const summary = getLegalComplianceSummary(
      {
        ...completeShopFields,
        legalPages: [
          ...completeLegalPages.filter((page) => page.slug !== "cgv"),
          {
            slug: "cgv",
            content: "<p>Contenu à compléter depuis l'administration.</p>",
          },
        ],
        activeShippingRateCount: 1,
      },
      { includeInfrastructure: false },
    );
    expect(summary.missingRequired.some((item) => item.id === "legal-page-cgv")).toBe(
      true,
    );
  });

  it("bloque si aucun barème livraison actif", () => {
    const summary = getLegalComplianceSummary(
      {
        ...completeShopFields,
        legalPages: completeLegalPages,
        activeShippingRateCount: 0,
      },
      { includeInfrastructure: false },
    );
    expect(
      summary.missingRequired.some((item) => item.id === "activeShippingRates"),
    ).toBe(true);
  });

  it("oriente vers la bonne section admin", () => {
    expect(
      getLegalComplianceAction({
        id: "legal-page-cgv",
        label: "CGV",
        group: "pages",
        required: true,
        tier: "required",
        filled: false,
      }),
    ).toEqual({ href: "/admin/pages-legales", label: "Pages légales" });

    expect(
      getLegalComplianceAction({
        id: "activeShippingRates",
        label: "Barème",
        group: "livraison",
        required: true,
        tier: "required",
        filled: false,
      }),
    ).toEqual({ href: "/admin/livraison", label: "Livraison" });
  });

  it("signale les passages à valider juridiquement sans bloquer la vente", () => {
    const summary = getLegalComplianceSummary(
      {
        ...completeShopFields,
        legalPages: completeLegalPages,
        activeShippingRateCount: 1,
      },
      { includeInfrastructure: false },
    );
    expect(summary.isComplete).toBe(true);
    expect(summary.pendingLegalReview.length).toBeGreaterThan(0);
    expect(
      summary.pendingLegalReview.some((item) => item.id === "legal-review-global"),
    ).toBe(true);
  });

  it("considère REP textile comme recommandé uniquement", () => {
    const summary = getLegalComplianceSummary(
      { ...completeShopFields, repIdu: null },
      { includeInfrastructure: false },
    );
    expect(summary.isComplete).toBe(true);
    expect(summary.missingRecommended.some((item) => item.id === "repIdu")).toBe(true);
  });
});
