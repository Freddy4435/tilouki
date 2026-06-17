import { describe, expect, it } from "vitest";

import {
  CATALOGUE_QUICK_CHIPS,
  getContextualQuickChips,
  isCatalogueQuickChipActive,
} from "./catalogue-quick-chips";

describe("catalogue-quick-chips", () => {
  it("active les raccourcis selon l'URL", () => {
    const params = new URLSearchParams();
    const nouveautes = CATALOGUE_QUICK_CHIPS.find((chip) => chip.id === "nouveautes")!;

    expect(isCatalogueQuickChipActive(nouveautes, "/catalogue", params)).toBe(true);

    params.set("promo", "petit-prix");
    expect(isCatalogueQuickChipActive(nouveautes, "/catalogue", params)).toBe(false);

    const petitsPrix = CATALOGUE_QUICK_CHIPS.find((chip) => chip.id === "petits-prix")!;
    expect(isCatalogueQuickChipActive(petitsPrix, "/catalogue", params)).toBe(true);

    const bebe = CATALOGUE_QUICK_CHIPS.find((chip) => chip.id === "bebe")!;
    expect(
      isCatalogueQuickChipActive(bebe, "/categorie/bebe", new URLSearchParams()),
    ).toBe(true);
  });

  it("fournit des chips contextuels sur une page rayon", () => {
    const chips = getContextualQuickChips("bebe");
    expect(chips.some((chip) => chip.id === "nouveautes")).toBe(true);
    expect(chips.some((chip) => chip.href.includes("/categorie/bebe"))).toBe(true);
    expect(chips.some((chip) => chip.id === "bebe")).toBe(false);
  });

  it("cible des pages catégorie sans lien header/footer ambigu", () => {
    const categoryChips = CATALOGUE_QUICK_CHIPS.filter((chip) =>
      ["bebe", "pyjamas"].includes(chip.id),
    );

    for (const chip of categoryChips) {
      expect(chip.href).toMatch(/^\/categorie\/[a-z-]+(\?|$)/);
      expect(chip.href).not.toMatch(/rituels|blog|guide-tailles|#/);
    }

    const bebe = CATALOGUE_QUICK_CHIPS.find((chip) => chip.id === "bebe")!;
    const pyjamas = CATALOGUE_QUICK_CHIPS.find((chip) => chip.id === "pyjamas")!;
    expect(bebe.label).toBe("Bébé");
    expect(pyjamas.label).toBe("Pyjamas");
  });
});
