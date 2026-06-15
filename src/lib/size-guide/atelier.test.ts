import { describe, expect, it } from "vitest";

import {
  ATELIER_AGE_IDS,
  ATELIER_USAGE_IDS,
  buildAtelierCatalogueHref,
  buildAtelierPageHref,
  parseAtelierSelection,
  resolveAtelierRecommendation,
} from "@/lib/size-guide/atelier";

describe("atelier size guide", () => {
  it("couvre toutes les combinaisons âge × usage", () => {
    for (const ageId of ATELIER_AGE_IDS) {
      for (const usageId of ATELIER_USAGE_IDS) {
        const rec = resolveAtelierRecommendation(ageId, usageId);
        expect(rec.sizeAdvice.length).toBeGreaterThan(20);
        expect(rec.marginAdvice.length).toBeGreaterThan(15);
        expect(rec.materials.length).toBeGreaterThanOrEqual(2);
        expect(rec.blogSlug).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("parse les query params avec repli sûr", () => {
    expect(parseAtelierSelection({ age: "1-3-ans", usage: "nuit" })).toEqual({
      ageId: "1-3-ans",
      usageId: "nuit",
    });
    expect(parseAtelierSelection({ age: "invalide", usage: "cadeau" })).toEqual({
      ageId: "3-12-mois",
      usageId: "cadeau",
    });
  });

  it("génère des liens catalogue et page partageables", () => {
    expect(buildAtelierPageHref("4-8-ans", "sortie")).toBe(
      "/guide-tailles?age=4-8-ans&usage=sortie",
    );
    expect(buildAtelierCatalogueHref("0-3-mois", "nuit")).toContain("/categorie/pyjamas");
    expect(buildAtelierCatalogueHref("1-3-ans", "quotidien")).toContain("ages=");
  });
});
