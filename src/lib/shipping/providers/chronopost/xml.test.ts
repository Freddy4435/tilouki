import { describe, expect, it } from "vitest";

import {
  CHRONOPOST_ERROR_BAD_CREDENTIALS,
  CHRONOPOST_ERROR_NO_RESULT,
  describeChronopostError,
  parseChronopostPickupPoint,
  parseChronopostResponse,
} from "@/lib/shipping/providers/chronopost/xml";

const SAMPLE_POINT_BLOCK = `
  <identifiant>1699P</identifiant>
  <nom>Pickup Maison de la Presse</nom>
  <adresse1>12 rue de Rivoli</adresse1>
  <adresse2></adresse2>
  <adresse3>Bâtiment A</adresse3>
  <codePostal>75001</codePostal>
  <localite>PARIS</localite>
  <codePays>FR</codePays>
`;

function wrapReturn(inner: string): string {
  return `<return>${inner}</return>`;
}

describe("parseChronopostPickupPoint", () => {
  it("mappe un bloc PointCHR vers PickupPoint", () => {
    const point = parseChronopostPickupPoint(SAMPLE_POINT_BLOCK);

    expect(point).toEqual({
      id: "1699P",
      name: "Pickup Maison de la Presse",
      address: "12 rue de Rivoli, Bâtiment A",
      zip: "75001",
      city: "PARIS",
      country: "FR",
    });
  });

  it("retourne null si des champs obligatoires manquent", () => {
    expect(parseChronopostPickupPoint("<nom>Test</nom>")).toBeNull();
  });
});

describe("parseChronopostResponse", () => {
  it("parse une réponse OK avec un point", () => {
    const xml = wrapReturn(`
      <errorCode>0</errorCode>
      <listePointRelais>${SAMPLE_POINT_BLOCK}</listePointRelais>
    `);

    const result = parseChronopostResponse(xml);

    expect(result.errorCode).toBe("0");
    expect(result.points).toHaveLength(1);
    expect(result.points[0]?.id).toBe("1699P");
  });

  it("classe le code 601 comme aucun résultat", () => {
    const result = parseChronopostResponse(
      wrapReturn(`<errorCode>${CHRONOPOST_ERROR_NO_RESULT}</errorCode>`),
    );

    expect(result.errorCode).toBe("601");
    expect(result.points).toEqual([]);
  });

  it("classe le code 1500 comme identifiants invalides", () => {
    const result = parseChronopostResponse(
      wrapReturn(`<errorCode>${CHRONOPOST_ERROR_BAD_CREDENTIALS}</errorCode>`),
    );

    expect(result.errorCode).toBe("1500");
    expect(describeChronopostError("1500")).toContain("contrat");
  });
});
