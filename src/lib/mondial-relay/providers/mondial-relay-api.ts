import "server-only";

import { createHash } from "node:crypto";

import { getMondialRelayBrandId, isMondialRelayApiConfigured } from "@/lib/mondial-relay/env";
import type {
  RelayPoint,
  RelaySearchParams,
  RelaySearchResult,
  ShippingProvider,
} from "@/lib/mondial-relay/types";

const MR_SOAP_ENDPOINT = "https://api.mondialrelay.com/Web_Services.asmx";

function buildSecurity(parts: string[], privateKey: string): string {
  return createHash("md5")
    .update(parts.join("") + privateKey)
    .digest("hex")
    .toUpperCase();
}

function extractTagValue(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function parseRelayPointsFromXml(xml: string): RelayPoint[] {
  const stat = extractTagValue(xml, "STAT");
  if (stat && stat !== "0") {
    return [];
  }

  const points: RelayPoint[] = [];
  const blockRegex = /<PointRelais_Details>([\s\S]*?)<\/PointRelais_Details>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(xml)) !== null) {
    const block = match[1] ?? "";
    const id = extractTagValue(block, "Num");
    const name = extractTagValue(block, "LgAdr1") || extractTagValue(block, "Nom");
    const address =
      [extractTagValue(block, "LgAdr3"), extractTagValue(block, "LgAdr4")]
        .filter(Boolean)
        .join(", ") || extractTagValue(block, "Adresse1");
    const zip = extractTagValue(block, "CP");
    const city = extractTagValue(block, "Ville");
    const country = extractTagValue(block, "Pays") || "FR";

    if (!id || !zip || !city) continue;

    points.push({
      id,
      name: name || `Point relais ${id}`,
      address: address || city,
      zip,
      city,
      country,
    });
  }

  return points;
}

async function searchMondialRelayApi(params: RelaySearchParams): Promise<RelayPoint[]> {
  const brandId = getMondialRelayBrandId()!;
  const privateKey = process.env.MONDIAL_RELAY_PRIVATE_KEY!;
  const pays = params.country ?? "FR";
  const ville = params.city ?? "";
  const cp = params.zip.replace(/\s/g, "");
  const numPointRelais = "";
  const latitude = "";
  const longitude = "";
  const taille = "";
  const poids = params.weightGrams ? String(params.weightGrams) : "";
  const action = "";
  const delaiEnvoi = "";
  const rayonRecherche = "20";
  const typeActivite = "";

  const security = buildSecurity(
    [
      brandId,
      pays,
      numPointRelais,
      ville,
      cp,
      latitude,
      longitude,
      taille,
      poids,
      action,
      delaiEnvoi,
      rayonRecherche,
      typeActivite,
    ],
    privateKey,
  );

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${brandId}</Enseigne>
      <Pays>${pays}</Pays>
      <NumPointRelais>${numPointRelais}</NumPointRelais>
      <Ville>${ville}</Ville>
      <CP>${cp}</CP>
      <Latitude>${latitude}</Latitude>
      <Longitude>${longitude}</Longitude>
      <Taille>${taille}</Taille>
      <Poids>${poids}</Poids>
      <Action>${action}</Action>
      <DelaiEnvoi>${delaiEnvoi}</DelaiEnvoi>
      <RayonRecherche>${rayonRecherche}</RayonRecherche>
      <TypeActivite>${typeActivite}</TypeActivite>
      <Security>${security}</Security>
    </WSI4_PointRelais_Recherche>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(MR_SOAP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche",
    },
    body: soapBody,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la recherche de points relais Mondial Relay.");
  }

  const xml = await response.text();
  return parseRelayPointsFromXml(xml);
}

export class MondialRelayApiProvider implements ShippingProvider {
  readonly name = "mondial_relay" as const;

  async searchRelayPoints(params: RelaySearchParams): Promise<RelaySearchResult> {
    if (!isMondialRelayApiConfigured()) {
      return {
        points: [],
        source: "mondial_relay_api",
        configured: false,
        message: "API Mondial Relay non configurée.",
      };
    }

    const points = await searchMondialRelayApi(params);

    return {
      points,
      source: "mondial_relay_api",
      configured: true,
      message: points.length === 0 ? "Aucun point relais trouvé." : undefined,
    };
  }
}
