import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getLegalPage: vi.fn(),
}));

vi.mock("@/lib/supabase/queries/legal", () => ({
  getLegalPage: mocks.getLegalPage,
}));

import { buildLegalContext } from "@/lib/legal/context";
import {
  auditPublicLegalPages,
  getCheckoutLegalBlockers,
  isLegalPublicationReady,
  renderSafePublicLegalHtml,
} from "@/lib/legal/publication";
import { containsPublicLegalPlaceholder, renderLegalContent } from "@/lib/legal/render";
import { getDefaultLegalTemplate } from "@/lib/legal/templates";
import { buildStorefrontNavigation } from "@/lib/navigation/build-storefront-nav";
import type { ShopSettings } from "@/lib/shop/types";

const completeShop: ShopSettings = {
  name: "Tilouki",
  tagline: "",
  description: "",
  legalName: "Marie Dupont",
  legalStatus: "Auto-entrepreneur",
  siret: "12345678901234",
  address: "1 rue Test, 75001 Paris",
  phone: "0600000000",
  contactEmail: "contact@tilouki.fr",
  vatEnabled: false,
  mediationName: "Médiateur Test",
  mediationUrl: "https://mediateur.example.fr",
  hostName: "Vercel Inc.",
  hostAddress: "440 N Barranca Ave #4133, Covina, CA 91723",
  hostEmail: "support@vercel.com",
  returnPolicy: "Retours sous 14 jours, frais à la charge du client sauf erreur.",
  primaryColor: "",
  minShippingCents: 490,
  categories: [],
  navigation: buildStorefrontNavigation([], []),
};

describe("publication légale", () => {
  it("refuse la publication si champs boutique incomplets", () => {
    expect(isLegalPublicationReady(null)).toBe(false);
    expect(isLegalPublicationReady({ ...completeShop, siret: null })).toBe(false);
  });

  it("accepte une boutique légalement complète", () => {
    expect(isLegalPublicationReady(completeShop)).toBe(true);
  });

  it("ne publie pas de placeholder sur les 6 pages", () => {
    const audit = auditPublicLegalPages(completeShop);
    expect(audit.ok).toBe(true);
    expect(audit.failures).toEqual([]);
  });

  it("rejette un HTML avec marqueur placeholder", () => {
    expect(containsPublicLegalPlaceholder("<p>Contenu à compléter</p>")).toBe(true);
    expect(containsPublicLegalPlaceholder("<p>{{legal_name}}</p>")).toBe(true);
    expect(containsPublicLegalPlaceholder("<p>Mentions légales Tilouki</p>")).toBe(
      false,
    );
  });

  it("renderSafePublicLegalHtml nettoie le contenu stocké placeholder", () => {
    const html = renderSafePublicLegalHtml(
      "cgv",
      "<p>Contenu à compléter depuis l'administration.</p>",
      completeShop,
    );
    expect(html).not.toBeNull();
    expect(html).not.toMatch(/compléter/i);
    expect(html).toContain("Conditions Générales");
  });

  it("getCheckoutLegalBlockers liste les paramètres boutique manquants", async () => {
    mocks.getLegalPage.mockResolvedValue(null);

    const blockers = await getCheckoutLegalBlockers({
      ...completeShop,
      siret: null,
    });

    expect(blockers.some((b) => b.id === "siret")).toBe(true);
    expect(blockers.length).toBeGreaterThanOrEqual(1);
  });

  it("intègre médiateur, IDU REP, franchise TVA et RCS dans les CGV rendues", () => {
    const shop: ShopSettings = {
      ...completeShop,
      repIdu: "FR123456789",
      vatNotice: "TVA non applicable, article 293 B du CGI.",
    };
    const ctx = buildLegalContext(shop, "public");
    const template = getDefaultLegalTemplate("cgv");
    expect(template).not.toBeNull();

    const html = renderLegalContent(template!.content, ctx);
    expect(html).toContain("293 B");
    expect(html).toContain("Médiateur Test");
    expect(html).toContain("https://mediateur.example.fr");
    expect(html).toContain("FR123456789");
    expect(html).toContain("dispensé d'immatriculation au registre du commerce");
    expect(html).toContain("Obligation de paiement");
    expect(html).toContain("ec.europa.eu/consumers/odr");
  });

  it("passe isLegalPublicationReady quand email, téléphone et médiation sont renseignés", () => {
    const almostComplete = {
      ...completeShop,
      contactEmail: "boutique@tilouki.fr",
      phone: "0612345678",
      mediationName: "Médiateur agréé",
      mediationUrl: "https://mediateur.example.fr/saisine",
    };
    expect(isLegalPublicationReady(almostComplete)).toBe(true);
    expect(isLegalPublicationReady({ ...almostComplete, mediationUrl: null })).toBe(
      false,
    );
    expect(isLegalPublicationReady({ ...almostComplete, phone: null })).toBe(false);
  });
});
