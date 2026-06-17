import { describe, expect, it } from "vitest";

import {
  buildCatalogueCapsuleModules,
  getCatalogueCapsuleRituals,
} from "@/lib/rituals/catalogue-capsules";
import { getRitualBySlug } from "@/lib/rituals/rituals";

describe("catalogue-capsules", () => {
  it("expose les capsules de la home sur le catalogue", () => {
    expect(getCatalogueCapsuleRituals().map((r) => r.slug)).toEqual([
      "nuit-calme",
      "jour-de-pluie",
      "bebe-cocon",
      "matin-presse",
      "petit-budget",
    ]);
  });

  it("filtre les capsules par rayon", () => {
    const pyjamas = getCatalogueCapsuleRituals("pyjamas");
    expect(pyjamas.some((r) => r.slug === "nuit-calme")).toBe(true);
    expect(pyjamas.length).toBeLessThanOrEqual(5);
  });

  it("construit les modules avec produits", () => {
    const ritual = getRitualBySlug("nuit-calme")!;
    const modules = buildCatalogueCapsuleModules([], "pyjamas");
    const nuit = modules.find((m) => m.ritual.slug === "nuit-calme");
    expect(nuit?.ritual.title).toBe(ritual.title);
    expect(nuit?.products).toEqual([]);
  });
});
