import "server-only";

import type { RelayPoint } from "@/lib/shipping/types";

/**
 * Codes retour STAT du Web Service Mondial Relay (WSI4_PointRelais_Recherche).
 * Source : documentation officielle Mondial Relay « Codes retours ».
 */
export const WSI4_STAT_LABELS: Record<string, string> = {
  "0": "Opération effectuée avec succès",
  "1": "Enseigne invalide",
  "2": "Numéro d'enseigne vide ou inexistant",
  "8": "Mot de passe ou hachage invalide",
  "9": "Ville non reconnue ou non unique",
  "10": "Type de collecte invalide",
  "24": "Numéro de Point Relais invalide",
  "74": "Langue invalide",
  "92": "Solde insuffisant (compte prépayé)",
  "93": "Aucun élément retourné par le plan de tri",
  "94": "Colis inexistant",
  "95": "Compte enseigne non activé",
  "97": "Clé de sécurité invalide",
  "98": "Erreur générique (paramètres invalides)",
  "99": "Erreur générique du service Mondial Relay",
};

/**
 * - "ok"            : STAT 0
 * - "not_found"     : entrée invalide / aucun résultat → message client normal
 * - "configuration" : identifiants ou paramètres d'intégration en cause → alerter l'admin
 * - "system"        : erreur côté Mondial Relay (ou code inconnu) → réessayer plus tard
 */
export type Wsi4StatCategory = "ok" | "not_found" | "configuration" | "system";

const CONFIGURATION_STATS = new Set(["1", "2", "8", "10", "74", "95", "97"]);
const NOT_FOUND_STATS = new Set(["9", "24"]);

export function categorizeWsi4Stat(stat: string): Wsi4StatCategory {
  if (stat === "0") return "ok";
  if (CONFIGURATION_STATS.has(stat)) return "configuration";
  if (NOT_FOUND_STATS.has(stat)) return "not_found";
  return "system";
}

export function describeWsi4Stat(stat: string): string {
  return WSI4_STAT_LABELS[stat] ?? `Code STAT inconnu (${stat})`;
}

/* -------------------------------------------------------------------------- */
/* Codes STAT spécifiques à la création d'expédition (WSI2_CreationEtiquette) */
/* -------------------------------------------------------------------------- */

/**
 * Libellés des codes paramètres documentés pour WSI2_CreationExpedition /
 * WSI2_CreationEtiquette (doc officielle MR « Codes retours »).
 */
export const WSI2_LABEL_STAT_LABELS: Record<string, string> = {
  "5": "Référence d'expédition (NDossier) invalide",
  "7": "Référence destinataire (NClient) invalide",
  "11": "Numéro de Point Relais de collecte invalide",
  "12": "Pays du Point Relais de collecte invalide",
  "13": "Type de livraison invalide",
  "14": "Numéro de Point Relais de livraison invalide",
  "15": "Pays du Point Relais de livraison invalide",
  "16": "Code pays invalide",
  "17": "Adresse invalide",
  "18": "Ville invalide",
  "19": "Code postal invalide",
  "20": "Poids du colis invalide",
  "21": "Longueur développée invalide",
  "22": "Taille du colis invalide",
  "26": "Temps de montage invalide",
  "27": "Mode de collecte ou de livraison invalide",
  "28": "Mode de collecte invalide",
  "29": "Mode de livraison invalide",
  "30": "Adresse expéditeur (L1) invalide",
  "31": "Adresse expéditeur (L2) invalide",
  "33": "Adresse expéditeur (L3) invalide",
  "34": "Adresse expéditeur (L4) invalide",
  "35": "Ville expéditeur invalide",
  "36": "Code postal expéditeur invalide",
  "37": "Pays expéditeur invalide",
  "38": "Numéro de téléphone invalide",
  "39": "Adresse e-mail invalide",
  "40": "Paramètres manquants",
  "42": "Montant CRT (contre-remboursement) invalide",
  "43": "Devise CRT invalide",
  "44": "Valeur d'expédition invalide",
  "45": "Devise de la valeur d'expédition invalide",
  "46": "Plage de numéros d'expédition épuisée",
  "47": "Nombre de colis invalide",
  "48": "Multi-colis non autorisé en Point Relais",
  "50": "Adresse destinataire (L1) invalide",
  "51": "Adresse destinataire (L2) invalide",
  "53": "Adresse destinataire (L3) invalide",
  "54": "Adresse destinataire (L4) invalide",
  "55": "Ville destinataire invalide",
  "56": "Code postal destinataire invalide",
  "57": "Pays destinataire invalide",
  "59": "E-mail destinataire invalide",
  "60": "Champ texte invalide (sans impact)",
  "61": "Demande d'avisage invalide",
  "62": "Information de livraison complémentaire invalide",
  "63": "Assurance invalide",
  "64": "Temps de montage invalide",
  "65": "Rendez-vous invalide",
  "66": "Reprise invalide",
  "70": "Numéro de Point Relais invalide",
  "72": "Langue expéditeur invalide",
  "73": "Langue destinataire invalide",
  "78": "Pays de collecte invalide",
  "79": "Pays de livraison invalide",
  "91": "Nature de point de vente non autorisée pour ce compte",
  "92": "Pays du Point Relais différent du pays destinataire (ou solde insuffisant)",
  "93": "Aucune information du plan de tri — vérifier la disponibilité du Point Relais",
};

/**
 * - "ok"            : STAT 0
 * - "validation"    : données de la commande/adresses/point relais à corriger
 * - "configuration" : identifiants ou compte d'intégration en cause (alerter l'admin)
 * - "system"        : erreur côté Mondial Relay → réessayer plus tard
 */
export type Wsi2LabelStatCategory = "ok" | "validation" | "configuration" | "system";

const LABEL_CONFIGURATION_STATS = new Set([
  "1",
  "2",
  "3",
  "8",
  "10",
  "49",
  "69",
  "74",
  "95",
  "97",
]);
const LABEL_SYSTEM_STATS = new Set(["25", "46", "94", "98", "99"]);

export function categorizeWsi2LabelStat(stat: string): Wsi2LabelStatCategory {
  if (stat === "0") return "ok";
  if (LABEL_CONFIGURATION_STATS.has(stat)) return "configuration";
  if (LABEL_SYSTEM_STATS.has(stat)) return "system";
  // Codes paramètres documentés (5–93) : données d'entrée à corriger.
  if (stat in WSI2_LABEL_STAT_LABELS || stat in WSI4_STAT_LABELS) return "validation";
  return "system";
}

export function describeWsi2LabelStat(stat: string): string {
  return (
    WSI2_LABEL_STAT_LABELS[stat] ?? WSI4_STAT_LABELS[stat] ?? `Code STAT inconnu (${stat})`
  );
}

export interface Wsi4Response {
  stat: string;
  statLabel: string;
  category: Wsi4StatCategory;
  points: RelayPoint[];
}

/* -------------------------------------------------------------------------- */
/* Parsing XML DOM-less : pas de regex, gestion CDATA, entités et espaces.    */
/* Suffisant et volontairement strict pour le schéma plat de WSI4.            */
/* -------------------------------------------------------------------------- */

const NAMED_ENTITIES: Record<string, string> = {
  lt: "<",
  gt: ">",
  amp: "&",
  quot: '"',
  apos: "'",
};

function decodeXmlEntities(value: string): string {
  let out = "";
  let i = 0;
  while (i < value.length) {
    const amp = value.indexOf("&", i);
    if (amp === -1) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, amp);
    const semi = value.indexOf(";", amp + 1);
    // Entité trop longue ou non terminée : conserver le caractère tel quel.
    if (semi === -1 || semi - amp > 10) {
      out += "&";
      i = amp + 1;
      continue;
    }
    const entity = value.slice(amp + 1, semi);
    if (entity in NAMED_ENTITIES) {
      out += NAMED_ENTITIES[entity];
    } else if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      out += Number.isNaN(code) ? `&${entity};` : String.fromCodePoint(code);
    } else if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      out += Number.isNaN(code) ? `&${entity};` : String.fromCodePoint(code);
    } else {
      out += `&${entity};`;
    }
    i = semi + 1;
  }
  return out;
}

/** Concatène texte + sections CDATA, décode les entités hors CDATA, normalise les espaces. */
function decodeXmlText(raw: string): string {
  let out = "";
  let i = 0;
  while (i < raw.length) {
    const cdataStart = raw.indexOf("<![CDATA[", i);
    if (cdataStart === -1) {
      out += decodeXmlEntities(raw.slice(i));
      break;
    }
    out += decodeXmlEntities(raw.slice(i, cdataStart));
    const cdataEnd = raw.indexOf("]]>", cdataStart + 9);
    if (cdataEnd === -1) {
      out += raw.slice(cdataStart + 9);
      break;
    }
    out += raw.slice(cdataStart + 9, cdataEnd);
    i = cdataEnd + 3;
  }
  // WSI4 complète certains champs avec des espaces : normalisation systématique.
  return out.split(/\s+/u).filter(Boolean).join(" ");
}

function isTagNameBoundary(char: string | undefined): boolean {
  return (
    char === ">" ||
    char === "/" ||
    char === " " ||
    char === "\t" ||
    char === "\n" ||
    char === "\r"
  );
}

interface TagPosition {
  /** Index du premier caractère après la balise. */
  contentStart: number;
  selfClosing: boolean;
}

function findOpeningTag(
  xml: string,
  lowerXml: string,
  tag: string,
  from: number,
): TagPosition | null {
  const needle = `<${tag}`;
  let idx = from;
  for (;;) {
    idx = lowerXml.indexOf(needle, idx);
    if (idx === -1) return null;
    const afterName = idx + needle.length;
    if (!isTagNameBoundary(xml[afterName])) {
      // Préfixe d'un autre nom de balise (ex. <Num vs <Numero) : continuer.
      idx = afterName;
      continue;
    }
    const close = xml.indexOf(">", afterName);
    if (close === -1) return null;
    return { contentStart: close + 1, selfClosing: xml[close - 1] === "/" };
  }
}

interface ClosingTagPosition {
  start: number;
  end: number;
}

function findClosingTag(
  xml: string,
  lowerXml: string,
  tag: string,
  from: number,
): ClosingTagPosition | null {
  const needle = `</${tag}`;
  let idx = from;
  for (;;) {
    idx = lowerXml.indexOf(needle, idx);
    if (idx === -1) return null;
    let cursor = idx + needle.length;
    while (cursor < xml.length && (xml[cursor] === " " || xml[cursor] === "\t"))
      cursor += 1;
    if (xml[cursor] === ">") return { start: idx, end: cursor + 1 };
    idx += needle.length;
  }
}

/** Contenus bruts de toutes les occurrences de <tag>…</tag> (insensible à la casse). */
export function extractXmlBlocks(xml: string, tag: string): string[] {
  const lowerXml = xml.toLowerCase();
  const lowerTag = tag.toLowerCase();
  const blocks: string[] = [];
  let cursor = 0;

  for (;;) {
    const open = findOpeningTag(xml, lowerXml, lowerTag, cursor);
    if (!open) break;
    if (open.selfClosing) {
      blocks.push("");
      cursor = open.contentStart;
      continue;
    }
    const close = findClosingTag(xml, lowerXml, lowerTag, open.contentStart);
    if (!close) break;
    blocks.push(xml.slice(open.contentStart, close.start));
    cursor = close.end;
  }

  return blocks;
}

/** Valeur texte décodée de la première occurrence de <tag>, ou null si absente. */
export function extractXmlValue(xml: string, tag: string): string | null {
  const blocks = extractXmlBlocks(xml, tag);
  if (blocks.length === 0) return null;
  return decodeXmlText(blocks[0] ?? "");
}

const OPENING_HOURS_DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

function parseOpeningHours(block: string): string | undefined {
  const lines: string[] = [];

  for (const day of OPENING_HOURS_DAYS) {
    const hours = extractXmlValue(block, `Horaires_${day}`);
    if (hours?.trim()) {
      lines.push(`${day.slice(0, 3)}. ${hours.trim()}`);
    }
  }

  return lines.length > 0 ? lines.join(" · ") : undefined;
}

function parsePointRelaisBlock(block: string): RelayPoint | null {
  const id = extractXmlValue(block, "Num") ?? "";
  const name = extractXmlValue(block, "LgAdr1") || extractXmlValue(block, "Nom") || "";
  const address =
    [extractXmlValue(block, "LgAdr3"), extractXmlValue(block, "LgAdr4")]
      .filter(Boolean)
      .join(", ") ||
    extractXmlValue(block, "Adresse1") ||
    "";
  const zip = extractXmlValue(block, "CP") ?? "";
  const city = extractXmlValue(block, "Ville") ?? "";
  const country = extractXmlValue(block, "Pays") || "FR";

  if (!id || !zip || !city) return null;

  return {
    id,
    name: name || `Point relais ${id}`,
    address: address || city,
    zip,
    city,
    country,
    openingHours: parseOpeningHours(block),
  };
}

/**
 * Analyse une réponse SOAP WSI4_PointRelais_Recherche.
 * Réponse sans STAT exploitable (vide, malformée) → catégorie "system".
 */
export function parseWsi4Response(xml: string): Wsi4Response {
  const stat = extractXmlValue(xml, "STAT");

  if (stat === null || stat === "") {
    return {
      stat: "unparseable",
      statLabel: "Réponse Mondial Relay illisible (balise STAT absente).",
      category: "system",
      points: [],
    };
  }

  const category = categorizeWsi4Stat(stat);
  const statLabel = describeWsi4Stat(stat);

  if (category !== "ok") {
    return { stat, statLabel, category, points: [] };
  }

  const points = extractXmlBlocks(xml, "PointRelais_Details")
    .map(parsePointRelaisBlock)
    .filter((point): point is RelayPoint => point !== null);

  return { stat, statLabel, category, points };
}
