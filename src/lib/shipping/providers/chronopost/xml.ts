import type { PickupPoint } from "@/lib/shipping/types";

/** Codes erreur officiels — annexe 5 de la documentation Web Services Chronopost. */
export const CHRONOPOST_ERROR_LABELS: Record<string, string> = {
  "300": "Paramètre au mauvais format",
  "301": "Paramètre obligatoire manquant",
  "302": "Format du code postal incorrect",
  "306": "Format de la date incorrect",
  "307": "Valeur de la date incorrecte",
  "309": "Paramètre numérique invalide",
  "317": "Paramètre holidayTolerant invalide",
  "319": "Distance maximum dépassée (99 km)",
  "320": "Nombre de points demandé trop élevé (max 25)",
  "321": "Format du poids incorrect",
  "601": "Aucun point Chronopost trouvé",
  "700": "Erreur système Chronopost",
  "1500": "Numéro de contrat ou mot de passe incorrect",
};

/** Code « aucun résultat » — réponse normale, pas une erreur. */
export const CHRONOPOST_ERROR_NO_RESULT = "601";

/** Code « identifiants invalides » — erreur de configuration. */
export const CHRONOPOST_ERROR_BAD_CREDENTIALS = "1500";

export function describeChronopostError(code: string): string {
  const label = CHRONOPOST_ERROR_LABELS[code];
  return label ? `${code} — ${label}` : `${code} — code non documenté`;
}

export function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

export function extractTagValue(xml: string, tag: string): string | null {
  const match = new RegExp(
    `<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`,
    "i",
  ).exec(xml);
  if (!match) return null;
  return decodeXmlEntities(match[1]?.trim() ?? "");
}

export function extractBlocks(xml: string, tag: string): string[] {
  const blocks: string[] = [];
  const regex = new RegExp(
    `<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`,
    "gi",
  );
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[1] ?? "");
  }
  return blocks;
}

/** Mappe une structure PointCHR vers le type PickupPoint commun. */
export function parseChronopostPickupPoint(block: string): PickupPoint | null {
  const id = extractTagValue(block, "identifiant");
  const name = extractTagValue(block, "nom");
  const zip = extractTagValue(block, "codePostal");
  const city = extractTagValue(block, "localite");

  if (!id || !name || !zip || !city) return null;

  const address = [
    extractTagValue(block, "adresse1"),
    extractTagValue(block, "adresse2"),
    extractTagValue(block, "adresse3"),
  ]
    .filter((line): line is string => Boolean(line))
    .join(", ");

  return {
    id,
    name,
    address: address || "Adresse non précisée",
    zip,
    city,
    country: extractTagValue(block, "codePays")?.toUpperCase() || "FR",
  };
}

export interface ChronopostParsedResponse {
  errorCode: string;
  errorMessage: string | null;
  points: PickupPoint[];
}

export function parseChronopostResponse(xml: string): ChronopostParsedResponse {
  const returnBlock = extractBlocks(xml, "return")[0] ?? xml;
  const errorCode = extractTagValue(returnBlock, "errorCode") ?? "700";
  const points = extractBlocks(returnBlock, "listePointRelais")
    .map(parseChronopostPickupPoint)
    .filter((point): point is PickupPoint => point !== null);

  return {
    errorCode,
    errorMessage: extractTagValue(returnBlock, "errorMessage"),
    points,
  };
}
