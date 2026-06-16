import { describe, expect, it } from "vitest";

import {
  getCatalogueEmptySuggestions,
  getPopularSizeSuggestions,
} from "./catalogue-empty-suggestions";

describe("catalogue-empty-suggestions", () => {
  it("propose des rayons et nouveautés sans lien blog", () => {
    const suggestions = getCatalogueEmptySuggestions({ hasActiveFilters: true });
    expect(suggestions.some((item) => item.id === "nouveautes")).toBe(true);
    expect(suggestions.some((item) => item.id === "petits-prix")).toBe(true);
    expect(suggestions.some((item) => item.href.includes("/blog"))).toBe(false);
  });

  it("exclut le rayon courant des suggestions", () => {
    const suggestions = getCatalogueEmptySuggestions({
      categorySlug: "bebe",
      hasActiveFilters: true,
    });
    expect(suggestions.some((item) => item.id === "rayon-bebe")).toBe(false);
  });

  it("génère des liens tailles populaires", () => {
    const sizes = getPopularSizeSuggestions("fille");
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes[0]?.href).toContain("/categorie/fille");
    expect(sizes[0]?.href).toContain("tailles=");
  });
});
