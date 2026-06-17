import { describe, expect, it } from "vitest";

import {
  buildMomentsPanel,
  buildRayonsPanel,
  buildUniverseMegaPanels,
  NAV_CAPSULE_MOMENTS,
  NAV_HREF,
} from "@/lib/navigation/nav-config";

const ALL_CATEGORIES = new Set([
  "bebe",
  "fille",
  "garcon",
  "pyjamas",
  "bodies",
  "robes",
  "pluie",
  "ensembles",
  "accessoires",
]);

describe("nav-config", () => {
  it("ordonne les panneaux mega-menu : moment, âge, rayons, affaires", () => {
    const panels = buildUniverseMegaPanels(
      "bebe",
      { hasLowPrice: true, hasLastPiece: true },
      ALL_CATEGORIES,
    );

    expect(panels.map((panel) => panel.title)).toEqual([
      "En ce moment",
      "Par âge",
      "Par moment",
      "Rayons",
      "Bonnes affaires",
    ]);
  });

  it("expose les quatre capsules avec des liens rituel explicites", () => {
    expect(NAV_CAPSULE_MOMENTS.map((item) => item.label)).toEqual([
      "Nuit douce",
      "Matin école",
      "Jour de pluie",
      "Bébé cocon",
    ]);

    for (const { ritualSlug } of NAV_CAPSULE_MOMENTS) {
      expect(`/rituels/${ritualSlug}`).toMatch(/^\/rituels\/[a-z-]+$/);
    }
  });

  it("filtre les rayons selon les catégories disponibles", () => {
    const limited = new Set(["bebe", "pyjamas"]);
    const panel = buildRayonsPanel("bebe", limited);

    expect(panel.links.every((link) => link.href.startsWith("/categorie/"))).toBe(true);
    expect(panel.links.some((link) => link.href.includes("/categorie/bodies"))).toBe(
      false,
    );
    expect(panel.links.some((link) => link.href.includes("/categorie/bebe"))).toBe(true);
  });

  it("cible des pages utiles sans ancres ambiguës dans les rayons", () => {
    const panel = buildRayonsPanel("fille", ALL_CATEGORIES);

    for (const link of panel.links) {
      expect(link.href).toMatch(/^\/categorie\/[a-z-]+(\?|$)/);
      expect(link.href).not.toMatch(/rituels|blog|guide-tailles|#/);
    }
  });

  it("relie Par moment aux capsules pertinentes pour le rayon", () => {
    const bebeMoments = buildMomentsPanel("bebe");
    expect(bebeMoments.title).toBe("Par moment");
    expect(bebeMoments.links.some((link) => link.href === "/rituels/bebe-cocon")).toBe(
      true,
    );
    expect(bebeMoments.links.some((link) => link.href === "/rituels/nuit-calme")).toBe(
      true,
    );

    const filleMoments = buildMomentsPanel("fille");
    expect(filleMoments.links.some((link) => link.href === "/rituels/matin-presse")).toBe(
      true,
    );
    expect(
      filleMoments.links.some((link) => link.href === "/rituels/jour-de-pluie"),
    ).toBe(true);
  });

  it("pointe En ce moment vers catalogue et arrivage", () => {
    const panels = buildUniverseMegaPanels(
      "garcon",
      { hasLowPrice: false, hasLastPiece: false },
      ALL_CATEGORIES,
    );
    const now = panels.find((panel) => panel.title === "En ce moment");

    expect(now?.links.some((link) => link.href.includes("/catalogue"))).toBe(true);
    expect(now?.links.some((link) => link.href === NAV_HREF.arrivageMercredi)).toBe(
      true,
    );
    expect(now?.links.some((link) => link.href === NAV_HREF.capsules)).toBe(true);
  });
});
