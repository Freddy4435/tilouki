import { describe, expect, it } from "vitest";

import {
  buildCatalogueQueryString,
  parseCatalogueQuery,
  serializeCatalogueQueryToParams,
} from "@/lib/catalog/parse-catalogue-query";
import { parseMultiParamValue } from "@/lib/catalog/catalogue-search-params";

describe("parseCatalogueQuery", () => {
  it("conserve la rétrocompatibilité des URLs existantes", () => {
    expect(
      parseCatalogueQuery({
        categorie: "bebe",
        genre: "fille",
        tri: "price_asc",
        page: "2",
        prix_min: "12.5",
        prix_max: "30",
        promo: "petit-prix",
        q: "body",
      }),
    ).toEqual({
      categorySlug: "bebe",
      gender: "fille",
      sort: "price_asc",
      page: 2,
      minPriceCents: 1250,
      maxPriceCents: 3000,
      promo: "petit-prix",
      query: "body",
      sizes: [],
      colors: [],
      ages: [],
    });
  });

  it("parse les facettes multi-valeurs", () => {
    expect(
      parseCatalogueQuery({
        tailles: "4 ans,6 ans",
        couleurs: ["Rose", "Bleu marine"],
        ages: "3-4 ans",
      }),
    ).toMatchObject({
      sizes: ["4 ans", "6 ans"],
      colors: ["Rose", "Bleu marine"],
      ages: ["3-4 ans"],
    });
  });

  it("ignore les valeurs invalides ou excessives", () => {
    expect(
      parseCatalogueQuery({ page: "-3", prix_min: "abc", tri: "hack" }),
    ).toMatchObject({
      page: 1,
      minPriceCents: undefined,
      sort: "newest",
    });
    expect(parseMultiParamValue("a,".repeat(40)).length).toBeLessThanOrEqual(24);
  });
});

describe("serializeCatalogueQueryToParams", () => {
  it("reconstruit une URL partageable", () => {
    const params = serializeCatalogueQueryToParams({
      sizes: ["4 ans", "6 ans"],
      colors: ["Rose"],
      ages: ["3-4 ans"],
      minPriceCents: 1500,
      sort: "price_desc",
      page: 2,
    });

    expect(params).toEqual({
      tailles: "4 ans,6 ans",
      couleurs: "Rose",
      ages: "3-4 ans",
      prix_min: "15",
      tri: "price_desc",
      page: "2",
    });
    expect(buildCatalogueQueryString({ sizes: ["4 ans"] })).toBe("tailles=4+ans");
  });
});
