import { describe, expect, it } from "vitest";

import {
  formatArticleCount,
  formatCatalogueResultsSummary,
  formatPagePosition,
  getSortLabel,
  sanitizeCatalogueDisplayValue,
} from "@/lib/catalog/catalogue-labels";
import { variantMatchesAgeBand } from "@/lib/catalog/catalogue-age-bands";
import { parseCatalogueQuery } from "@/lib/catalog/parse-catalogue-query";

describe("catalogue-labels — affichage", () => {
  it("n'expose pas les valeurs techniques", () => {
    expect(getSortLabel("newest")).toBe("Nouveautés");
    expect(getSortLabel("__all__")).toBe("Nouveautés");
    expect(sanitizeCatalogueDisplayValue("__all__", "Toutes")).toBe("Toutes");
    expect(sanitizeCatalogueDisplayValue("newest", "Tri")).toBe("Tri");
  });

  it("formate les compteurs articles et pages", () => {
    expect(formatArticleCount(13)).toBe("13 articles");
    expect(formatArticleCount(1)).toBe("1 article");
    expect(formatPagePosition(1, 2)).toBe("page 1 sur 2");
    expect(formatCatalogueResultsSummary(13, 1, 2)).toBe("13 articles · page 1 sur 2");
  });
});

describe("catalogue-age-bands", () => {
  it("associe les variantes aux tranches parent", () => {
    expect(variantMatchesAgeBand("6 mois", null, "bebe")).toBe(true);
    expect(variantMatchesAgeBand("3-4 ans", null, "1-3-ans")).toBe(true);
    expect(variantMatchesAgeBand(null, "6 ans", "4-8-ans")).toBe(true);
    expect(variantMatchesAgeBand("4 ans", null, "bebe")).toBe(false);
  });
});

describe("parseCatalogueQuery — tranche_age", () => {
  it("parse la tranche d'âge catalogue", () => {
    expect(parseCatalogueQuery({ tranche_age: "bebe" }).ageBand).toBe("bebe");
    expect(parseCatalogueQuery({ tranche_age: "invalid" }).ageBand).toBeUndefined();
  });
});
