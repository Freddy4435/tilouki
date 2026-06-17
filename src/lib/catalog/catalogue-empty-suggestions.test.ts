import { describe, expect, it } from "vitest";

import {
  buildCatalogueEmptyCopy,
  getAvailableSizesSuggestion,
  getCatalogueEmptySuggestions,
  getNearbyCapsuleSuggestions,
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
      categories: [
        {
          id: "1",
          name: "Bébé",
          slug: "bebe",
          description: null,
          imageUrl: null,
          sortOrder: 0,
        },
        {
          id: "2",
          name: "Fille",
          slug: "fille",
          description: null,
          imageUrl: null,
          sortOrder: 1,
        },
      ],
    });
    expect(suggestions.some((item) => item.id === "cat-bebe")).toBe(false);
    expect(suggestions.some((item) => item.id === "cat-fille")).toBe(true);
  });

  it("génère des liens tailles populaires", () => {
    const sizes = getPopularSizeSuggestions("fille");
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes[0]?.href).toContain("/categorie/fille");
    expect(sizes[0]?.href).toContain("tailles=");
  });

  it("propose des capsules réelles proches du rayon", () => {
    const capsules = getNearbyCapsuleSuggestions("bebe");
    expect(capsules.length).toBeGreaterThan(0);
    expect(capsules.every((item) => item.href.startsWith("/rituels/"))).toBe(true);
    expect(capsules.every((item) => !item.href.includes("/blog"))).toBe(true);
  });

  it("pointe vers les tailles disponibles sans filtre", () => {
    const link = getAvailableSizesSuggestion("pyjamas");
    expect(link.label).toBe("Voir les tailles disponibles");
    expect(link.href).toContain("/categorie/pyjamas");
  });

  it("utilise un ton marchand pour les rayons vides", () => {
    const copy = buildCatalogueEmptyCopy({ hasActiveFilters: false, categoryName: "Bébé" });
    expect(copy.title).toMatch(/arrive mercredi/i);
    expect(copy.body.length).toBeLessThan(160);
  });

  it("utilise un ton marchand pour les filtres sans résultat", () => {
    const copy = buildCatalogueEmptyCopy({ hasActiveFilters: true });
    expect(copy.title).toMatch(/aucune pièce/i);
    expect(
      getCatalogueEmptySuggestions({ hasActiveFilters: true, categorySlug: "fille" }).some(
        (item) => item.id === "available-sizes",
      ),
    ).toBe(true);
  });
});
