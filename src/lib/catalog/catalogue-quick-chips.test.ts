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
});
