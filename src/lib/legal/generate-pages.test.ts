import { describe, expect, it } from "vitest";

import { getDefaultLegalTemplate } from "@/lib/legal/templates";
import {
  isLegalPageManuallyEdited,
  listLegalPagesRequiringOverwriteConfirmation,
} from "@/lib/legal/generate-pages";

describe("generate-pages", () => {
  it("ne demande pas de confirmation pour une page vide ou placeholder", () => {
    const slugs = listLegalPagesRequiringOverwriteConfirmation([
      { slug: "cgv", content: "" },
      {
        slug: "mentions-legales",
        content: "<p>Contenu à compléter depuis l'administration.</p>",
      },
    ]);
    expect(slugs).toEqual([]);
  });

  it("demande confirmation si le contenu diffère du modèle", () => {
    const slugs = listLegalPagesRequiringOverwriteConfirmation([
      {
        slug: "cgv",
        content: "<h2>CGV personnalisées</h2><p>Texte rédigé à la main.</p>",
      },
    ]);
    expect(slugs).toEqual(["cgv"]);
  });

  it("considère le modèle par défaut comme non modifié manuellement", () => {
    const template = getDefaultLegalTemplate("mentions-legales");
    expect(template).not.toBeNull();
    expect(isLegalPageManuallyEdited(template!.content, "mentions-legales")).toBe(
      false,
    );
  });
});
