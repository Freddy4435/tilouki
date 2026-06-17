import { describe, expect, it } from "vitest";

import {
  CATALOGUE_PARAM_KEYS,
  countActiveCatalogueFilters,
} from "./catalogue-search-params";

describe("countActiveCatalogueFilters", () => {
  it("compte les filtres actifs hors pagination", () => {
    const params = new URLSearchParams();
    expect(countActiveCatalogueFilters(params)).toBe(0);

    params.set(CATALOGUE_PARAM_KEYS.gender, "fille");
    params.set(CATALOGUE_PARAM_KEYS.sizes, "4 ans,6 ans");
    params.set(CATALOGUE_PARAM_KEYS.promo, "petit-prix");
    expect(countActiveCatalogueFilters(params)).toBe(4);
  });

  it("ignore la catégorie verrouillée sur une page rayon", () => {
    const params = new URLSearchParams();
    params.set(CATALOGUE_PARAM_KEYS.category, "bebe");
    expect(countActiveCatalogueFilters(params, { lockedCategorySlug: "bebe" })).toBe(0);
  });
});
