import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildLegalContext } from "@/lib/legal/context";
import {
  finalizePublicLegalHtml,
  isPlaceholderLegalContent,
  resolveLegalPageHtml,
} from "@/lib/legal/render";

describe("legal render", () => {
  it("détecte le contenu placeholder stocké en base", () => {
    expect(isPlaceholderLegalContent("<p>Contenu à compléter depuis l'administration.</p>")).toBe(true);
    expect(isPlaceholderLegalContent("")).toBe(true);
    expect(isPlaceholderLegalContent("<h2>CGV</h2><p>Texte réel.</p>")).toBe(false);
  });

  it("nettoie les marqueurs admin sur le HTML public", () => {
    const dirty =
      '<p>SIRET : [À renseigner : numéro SIRET à 14 chiffres]</p><p>Contenu à compléter</p>';
    const clean = finalizePublicLegalHtml(dirty);
    expect(clean).not.toMatch(/à compléter/i);
    expect(clean).not.toMatch(/À renseigner/i);
  });

  it("résout une page légale sans afficher contenu à compléter", () => {
    const ctx = buildLegalContext(null, "public");
    const html = resolveLegalPageHtml(
      "mentions-legales",
      "<p>Contenu à compléter depuis l'administration.</p>",
      ctx,
      { audience: "public" },
    );

    expect(html).not.toMatch(/contenu à compléter/i);
    expect(html).not.toMatch(/\[À renseigner/i);
    expect(html).toContain("Éditeur du site");
    expect(html).toContain("Document type");
  });
});
