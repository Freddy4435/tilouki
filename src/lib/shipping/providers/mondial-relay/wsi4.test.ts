import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  categorizeWsi4Stat,
  describeWsi4Stat,
  extractXmlValue,
  parseWsi4Response,
} from "@/lib/shipping/providers/mondial-relay/wsi4";

function soapEnvelope(resultInner: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI4_PointRelais_RechercheResponse xmlns="http://www.mondialrelay.fr/webservice/">
      <WSI4_PointRelais_RechercheResult>
        ${resultInner}
      </WSI4_PointRelais_RechercheResult>
    </WSI4_PointRelais_RechercheResponse>
  </soap:Body>
</soap:Envelope>`;
}

const XML_TWO_POINTS = soapEnvelope(`
  <STAT>0</STAT>
  <PointsRelais>
    <PointRelais_Details>
      <Num>012417</Num>
      <LgAdr1><![CDATA[BODHI TELECOM]]></LgAdr1>
      <LgAdr3>   2 RUE DE MULHOUSE   </LgAdr3>
      <LgAdr4></LgAdr4>
      <CP> 75002 </CP>
      <Ville>PARIS</Ville>
      <Pays>FR</Pays>
    </PointRelais_Details>
    <PointRelais_Details>
      <Num>034439</Num>
      <LgAdr1>TABAC &amp; PRESSE</LgAdr1>
      <LgAdr3>38 RUE MAUCONSEIL</LgAdr3>
      <LgAdr4>BATIMENT B</LgAdr4>
      <CP>75001</CP>
      <Ville>PARIS</Ville>
      <Pays>FR</Pays>
    </PointRelais_Details>
  </PointsRelais>
`);

describe("parseWsi4Response", () => {
  it("parse un XML avec 2 points relais (CDATA, entités, espaces)", () => {
    const result = parseWsi4Response(XML_TWO_POINTS);

    expect(result.stat).toBe("0");
    expect(result.category).toBe("ok");
    expect(result.points).toHaveLength(2);

    expect(result.points[0]).toMatchObject({
      id: "012417",
      name: "BODHI TELECOM",
      address: "2 RUE DE MULHOUSE",
      zip: "75002",
      city: "PARIS",
      country: "FR",
    });

    expect(result.points[1]).toMatchObject({
      id: "034439",
      name: "TABAC & PRESSE",
      address: "38 RUE MAUCONSEIL, BATIMENT B",
      zip: "75001",
      city: "PARIS",
      country: "FR",
    });
  });

  it("parse les horaires d'ouverture quand présents", () => {
    const xml = soapEnvelope(`
      <STAT>0</STAT>
      <PointsRelais>
        <PointRelais_Details>
          <Num>012417</Num>
          <LgAdr1>BODHI TELECOM</LgAdr1>
          <LgAdr3>2 RUE DE MULHOUSE</LgAdr3>
          <CP>75002</CP>
          <Ville>PARIS</Ville>
          <Pays>FR</Pays>
          <Horaires_Lundi>09:00-12:00 14:00-19:00</Horaires_Lundi>
          <Horaires_Mardi>09:00-19:00</Horaires_Mardi>
        </PointRelais_Details>
      </PointsRelais>
    `);

    const result = parseWsi4Response(xml);

    expect(result.points[0]?.openingHours).toContain("Lun.");
    expect(result.points[0]?.openingHours).toContain("Mar.");
  });

  it("classe STAT=9 (ville inconnue) en not_found sans point", () => {
    const result = parseWsi4Response(soapEnvelope("<STAT>9</STAT>"));

    expect(result.stat).toBe("9");
    expect(result.category).toBe("not_found");
    expect(result.statLabel).toBe("Ville non reconnue ou non unique");
    expect(result.points).toEqual([]);
  });

  it("classe STAT=8 (hash invalide) en erreur de configuration", () => {
    const result = parseWsi4Response(soapEnvelope("<STAT>8</STAT>"));

    expect(result.category).toBe("configuration");
    expect(result.statLabel).toBe("Mot de passe ou hachage invalide");
  });

  it("classe STAT=99 et les codes inconnus en erreur système", () => {
    expect(parseWsi4Response(soapEnvelope("<STAT>99</STAT>")).category).toBe("system");
    expect(parseWsi4Response(soapEnvelope("<STAT>42</STAT>")).category).toBe("system");
  });

  it("retourne une erreur système pour un XML vide", () => {
    const result = parseWsi4Response("");

    expect(result.category).toBe("system");
    expect(result.points).toEqual([]);
    expect(result.stat).toBe("unparseable");
  });

  it("ne plante pas sur un XML malformé (balise non fermée)", () => {
    const result = parseWsi4Response("<STAT>0</STAT><PointRelais_Details><Num>0124");

    expect(result.category).toBe("ok");
    expect(result.points).toEqual([]);
  });

  it("ignore un bloc point incomplet (Num manquant)", () => {
    const xml = soapEnvelope(`
      <STAT>0</STAT>
      <PointRelais_Details>
        <CP>75001</CP>
        <Ville>PARIS</Ville>
      </PointRelais_Details>
    `);

    expect(parseWsi4Response(xml).points).toEqual([]);
  });
});

describe("extractXmlValue", () => {
  it("ne confond pas une balise avec un préfixe commun (Num vs Numero)", () => {
    expect(extractXmlValue("<Numero>999</Numero><Num>012345</Num>", "Num")).toBe(
      "012345",
    );
  });

  it("décode les entités numériques", () => {
    expect(extractXmlValue("<Ville>N&#xCE;MES &#233;t&#233;</Ville>", "Ville")).toBe(
      "NÎMES été",
    );
  });

  it("retourne null si la balise est absente", () => {
    expect(extractXmlValue("<Autre>x</Autre>", "Num")).toBeNull();
  });
});

describe("categorizeWsi4Stat / describeWsi4Stat", () => {
  it.each([
    ["0", "ok"],
    ["1", "configuration"],
    ["2", "configuration"],
    ["8", "configuration"],
    ["9", "not_found"],
    ["10", "configuration"],
    ["24", "not_found"],
    ["74", "configuration"],
    ["92", "system"],
    ["93", "system"],
    ["94", "system"],
    ["95", "configuration"],
    ["97", "configuration"],
    ["98", "system"],
    ["99", "system"],
  ])("STAT %s → %s", (stat, category) => {
    expect(categorizeWsi4Stat(stat)).toBe(category);
  });

  it("décrit un code inconnu sans planter", () => {
    expect(describeWsi4Stat("123")).toContain("123");
  });
});
