import { describe, expect, it } from "vitest";

import {
  deriveChildAutonomyNote,
  deriveComfortNote,
  isProductCuratedSelection,
  resolveBriefSizeTip,
  resolveContextualSizeAdvice,
  resolveProductCuratorContent,
  resolveProductConditionSummary,
  resolveVariantSizeAdvice,
} from "@/lib/catalog/product-page-content";

describe("resolveProductCuratorContent", () => {
  it("extrait un bloc « Pourquoi on l'a choisi »", () => {
    const result = resolveProductCuratorContent(
      "## Pourquoi on l'a choisi\n\nCoton bio doux, coupe ample, idéal pour l'école.\n\n## Description\n\nRobe à fleurs.",
      "Robe fleurie",
    );
    expect(result?.note).toContain("Coton bio doux");
    expect(result?.descriptionBody).toContain("Robe à fleurs");
  });

  it("utilise le premier paragraphe si description riche et distincte", () => {
    const result = resolveProductCuratorContent(
      "Maille côtelée confortable, parfaite pour la mi-saison. Coupe droite facile à superposer.",
      "Pull doux",
    );
    expect(result?.note).toContain("Maille côtelée");
  });
});

describe("deriveComfortNote", () => {
  it("déduit le confort depuis la matière", () => {
    expect(deriveComfortNote("100 % coton bio")).toMatch(/doux/i);
    expect(deriveComfortNote("lin")).toMatch(/respirant/i);
  });
});

describe("resolveContextualSizeAdvice", () => {
  it("adapte le conseil pour la seconde main", () => {
    expect(
      resolveContextualSizeAdvice({
        sizes: ["4 ans"],
        ageLabels: ["4 ans"],
        gender: "fille",
        material: "coton",
        secondHand: true,
      }),
    ).toMatch(/seconde main/i);
  });
});

describe("resolveBriefSizeTip", () => {
  it("retourne une phrase courte", () => {
    const tip = resolveBriefSizeTip({
      sizes: ["4 ans", "6 ans"],
      ageLabels: ["4 ans"],
      gender: "fille",
      material: "coton",
    });
    expect(tip.length).toBeLessThan(120);
    expect(tip).not.toMatch(/\n/);
  });
});

describe("isProductCuratedSelection", () => {
  it("détecte les nouveautés et la sélection éditoriale", () => {
    expect(
      isProductCuratedSelection({
        badges: ["new"],
        description: null,
        shortDescription: null,
      }),
    ).toBe(true);
    expect(
      isProductCuratedSelection({
        badges: [],
        description: "Notre coup de cœur de la semaine",
        shortDescription: null,
      }),
    ).toBe(true);
  });
});

describe("resolveProductConditionSummary", () => {
  it("résume l'état seconde main", () => {
    const summary = resolveProductConditionSummary({
      secondHand: true,
      curatedSelection: false,
      defects: [],
      material: null,
    });
    expect(summary?.title).toMatch(/seconde main/i);
  });
});

describe("deriveChildAutonomyNote", () => {
  it("propose une note autonomie pour les pyjamas", () => {
    expect(
      deriveChildAutonomyNote({
        name: "Pyjama coton bio",
        categorySlug: "pyjamas",
      }),
    ).toMatch(/autonomie/i);
  });

  it("reste silencieux si le produit ne le justifie pas", () => {
    expect(
      deriveChildAutonomyNote({
        name: "Bonnet laine",
        categorySlug: "accessoires",
      }),
    ).toBeNull();
  });
});

describe("resolveVariantSizeAdvice", () => {
  it("personnalise le conseil selon la taille sélectionnée", () => {
    const advice = resolveVariantSizeAdvice(
      { sizeLabel: "6 ans", ageLabel: "6 ans" },
      {
        sizes: ["4 ans", "6 ans"],
        ageLabels: ["6 ans"],
        gender: "fille",
        material: "coton",
      },
    );
    expect(advice).toMatch(/^Taille 6 ans/);
  });
});
