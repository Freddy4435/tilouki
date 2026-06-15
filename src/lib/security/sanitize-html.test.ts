import { describe, expect, it, vi } from "vitest";

import type { ShopSettings } from "@/lib/shop/types";

import { sanitizeLegalHtml } from "@/lib/security/sanitize-html";

vi.mock("server-only", () => ({}));

describe("sanitizeLegalHtml — XSS", () => {
  it("retire les balises script", () => {
    const html = '<p>OK</p><script>alert("x")</script>';
    expect(sanitizeLegalHtml(html)).toBe("<p>OK</p>");
  });

  it("retire les attributs on* inline", () => {
    const html = '<p onclick="evil()">Texte</p>';
    expect(sanitizeLegalHtml(html)).toBe("<p>Texte</p>");
  });

  it("neutralise img avec onerror", () => {
    const result = sanitizeLegalHtml('<p>x</p><img src=x onerror="alert(1)">');
    expect(result).toBe("<p>x</p>");
    expect(result).not.toMatch(/onerror|img/i);
  });

  it("neutralise svg avec onload", () => {
    const result = sanitizeLegalHtml(
      '<svg onload="alert(1)"><circle /></svg><p>ok</p>',
    );
    expect(result).toBe("<p>ok</p>");
    expect(result).not.toMatch(/svg|onload/i);
  });

  it("retire les href javascript:", () => {
    const result = sanitizeLegalHtml('<a href="javascript:alert(1)">clic</a>');
    expect(result).not.toContain("javascript:");
    expect(result).not.toMatch(/href=/i);
    expect(result).toContain("clic");
  });

  it("retire les iframes", () => {
    expect(
      sanitizeLegalHtml('<iframe src="https://evil.test"></iframe><p>ok</p>'),
    ).toBe("<p>ok</p>");
  });

  it("retire les attributs style dangereux", () => {
    expect(
      sanitizeLegalHtml('<p style="background:url(javascript:alert(1))">x</p>'),
    ).toBe("<p>x</p>");
    expect(sanitizeLegalHtml('<div style="color:red">x</div>')).toBe("x");
  });

  it("retire les balises non autorisées (object, embed)", () => {
    const result = sanitizeLegalHtml(
      '<object data="evil.swf"></object><embed src="evil.swf"><p>texte</p>',
    );
    expect(result).toBe("<p>texte</p>");
  });
});

describe("sanitizeLegalHtml — liens", () => {
  it("conserve les liens relatifs internes", () => {
    const result = sanitizeLegalHtml('<a href="/confidentialite">Politique</a>');
    expect(result).toContain('href="/confidentialite"');
  });

  it("conserve mailto et ajoute rel sur les liens externes", () => {
    const mailto = sanitizeLegalHtml('<a href="mailto:contact@tilouki.fr">Mail</a>');
    expect(mailto).toContain('href="mailto:contact@tilouki.fr"');

    const external = sanitizeLegalHtml('<a href="https://www.cnil.fr">CNIL</a>');
    expect(external).toContain('href="https://www.cnil.fr"');
    expect(external).toContain('rel="noopener noreferrer"');
  });

  it("ajoute noopener noreferrer aux liens http/https existants sans écraser rel", () => {
    const result = sanitizeLegalHtml(
      '<a href="https://example.com" rel="nofollow">Lien</a>',
    );
    expect(result).toContain("noopener");
    expect(result).toContain("noreferrer");
    expect(result).toContain("nofollow");
  });
});

describe("sanitizeLegalHtml — contenu légal", () => {
  it("préserve la structure des templates (titres, listes, tableau RGPD)", async () => {
    const { buildLegalContext } = await import("@/lib/legal/context");
    const { resolveLegalPageHtml } = await import("@/lib/legal/render");

    const shop: ShopSettings = {
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
      hostAddress: "Covina, CA",
      hostEmail: "support@vercel.com",
      returnPolicy: "Retours sous 14 jours.",
      primaryColor: "",
      minShippingCents: 490,
      categories: [],
      navigation: {
        topItems: [],
        mobileSections: [],
        categoryProductCounts: {},
        hasLowPriceProducts: false,
      },
    };

    const ctx = buildLegalContext(shop, "public");

    const cgv = sanitizeLegalHtml(
      resolveLegalPageHtml("cgv", null, ctx, { audience: "public" }),
    );
    expect(cgv).toContain("Conditions Générales");
    expect(cgv).toContain("<h2>");
    expect(cgv).toContain('href="/formulaire-retractation"');
    expect(cgv).not.toMatch(/<script|javascript:|on\w+=/i);

    const privacy = sanitizeLegalHtml(
      resolveLegalPageHtml("confidentialite", null, ctx, { audience: "public" }),
    );
    expect(privacy).toContain("<table>");
    expect(privacy).toContain("Exécution du contrat");
    expect(privacy).toContain('href="/donnees-personnelles"');
  });
});
