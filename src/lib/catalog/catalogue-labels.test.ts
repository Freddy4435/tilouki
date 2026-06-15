import { describe, expect, it } from "vitest";

import {
  CATALOGUE_FILTER_ALL,
  formatArticleCount,
  formatCatalogueResultsSummary,
  formatCategoryCountLabel,
  getCategoryFilterLabel,
  getGenderLabel,
  getSortLabel,
  sanitizeCatalogueDisplayValue,
} from "@/lib/catalog/catalogue-labels";

describe("catalogue-labels", () => {
  it("traduit les valeurs de tri techniques", () => {
    expect(getSortLabel("newest")).toBe("Nouveautés");
    expect(getSortLabel("price_asc")).toBe("Prix croissant");
    expect(getSortLabel("price_desc")).toBe("Prix décroissant");
    expect(getSortLabel(null)).toBe("Nouveautés");
  });

  it("affiche des libellés français pour les filtres « tous »", () => {
    expect(getGenderLabel(null)).toBe("Tous les genres");
    expect(getCategoryFilterLabel(null, [])).toBe("Toutes les catégories");
    expect(getCategoryFilterLabel("bebe", [{ slug: "bebe", name: "Bébé" }])).toBe(
      "Bébé",
    );
  });

  it("formate le compteur de catégories", () => {
    expect(formatCategoryCountLabel(0)).toBe("Catalogue en cours d'approvisionnement");
    expect(formatCategoryCountLabel(1)).toBe("1 catégorie disponible");
    expect(formatCategoryCountLabel(4)).toBe("4 catégories disponibles");
  });

  it("expose une valeur sentinelle pour les selects", () => {
    expect(CATALOGUE_FILTER_ALL).toBe("__all__");
    expect(sanitizeCatalogueDisplayValue(CATALOGUE_FILTER_ALL, "Toutes")).toBe(
      "Toutes",
    );
  });

  it("formate le résumé catalogue", () => {
    expect(formatArticleCount(0)).toBe("Aucun article");
    expect(formatCatalogueResultsSummary(5, 1, 1)).toBe("5 articles");
  });
});
