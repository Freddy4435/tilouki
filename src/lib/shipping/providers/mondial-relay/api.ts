import "server-only";

import { createHash } from "node:crypto";

import { z } from "zod";

import {
  getMondialRelayBrandId,
  isMondialRelayApiConfigured,
} from "@/lib/shipping/env";
import {
  categorizeWsi2LabelStat,
  describeWsi2LabelStat,
  extractXmlValue,
  parseWsi4Response,
  type Wsi4Response,
} from "@/lib/shipping/providers/mondial-relay/wsi4";
import { ShipmentLabelError, type ShipmentLabelErrorCategory } from "@/lib/shipping/errors";
import { logSecure } from "@/lib/security/log";
import type {
  CreateShipmentLabelInput,
  RelayLookupResult,
  RelayPoint,
  RelaySearchParams,
  RelaySearchResult,
  ShipmentLabel,
  ShippingProvider,
} from "@/lib/shipping/types";

/*
 * Création d'expédition : la doc officielle MR indique que WSI2_CreationEtiquette
 * (SOAP) n'est plus proposée aux NOUVEAUX comptes, remplacée par l'API REST
 * Connect v2 (« dual carrier »). On reste sur SOAP par défaut — cohérent avec
 * WSI4 déjà en place et valide pour les comptes existants. Si besoin d'un
 * backend REST v2, implémenter un second ShippingProvider derrière la même
 * interface createShipmentLabel.
 */
const MR_SOAP_ENDPOINT = "https://api.mondialrelay.com/Web_Services.asmx";
const MR_SOAP_ACTION_WSI4_SEARCH =
  "http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche";
const MR_SOAP_ACTION_WSI2_LABEL =
  "http://www.mondialrelay.fr/webservice/WSI2_CreationEtiquette";

/** Domaine à préfixer à URL_Etiquette (retournée sans protocole ni domaine). */
const MR_LABEL_BASE_URL = "https://www.mondialrelay.com";

/** Délai maximal d'attente d'une réponse SOAP Mondial Relay. */
const SOAP_TIMEOUT_MS = 8_000;

/** Levée quand le service MR est injoignable ou répond une erreur système. */
export class MondialRelayServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MondialRelayServiceError";
  }
}

export { ShipmentLabelError, type ShipmentLabelErrorCategory };

/**
 * Champs WSI4_PointRelais_Recherche, dans l'ordre imposé par la documentation
 * Mondial Relay (l'ordre détermine aussi le calcul du hash de sécurité).
 */
interface Wsi4RequestFields {
  Pays: string;
  NumPointRelais: string;
  Ville: string;
  CP: string;
  Latitude: string;
  Longitude: string;
  Taille: string;
  Poids: string;
  Action: string;
  DelaiEnvoi: string;
  RayonRecherche: string;
  TypeActivite: string;
}

const WSI4_FIELD_ORDER: readonly (keyof Wsi4RequestFields)[] = [
  "Pays",
  "NumPointRelais",
  "Ville",
  "CP",
  "Latitude",
  "Longitude",
  "Taille",
  "Poids",
  "Action",
  "DelaiEnvoi",
  "RayonRecherche",
  "TypeActivite",
];

function buildSecurityHash(
  brandId: string,
  fields: Wsi4RequestFields,
  privateKey: string,
): string {
  const parts = [brandId, ...WSI4_FIELD_ORDER.map((key) => fields[key])];
  return createHash("md5")
    .update(parts.join("") + privateKey)
    .digest("hex")
    .toUpperCase();
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildSoapBody(
  brandId: string,
  fields: Wsi4RequestFields,
  security: string,
): string {
  const xmlFields = WSI4_FIELD_ORDER.map(
    (key) => `      <${key}>${escapeXml(fields[key])}</${key}>`,
  ).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${escapeXml(brandId)}</Enseigne>
${xmlFields}
      <Security>${security}</Security>
    </WSI4_PointRelais_Recherche>
  </soap:Body>
</soap:Envelope>`;
}

async function postSoap(body: string, soapAction: string): Promise<string> {
  const response = await fetch(MR_SOAP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: soapAction,
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(SOAP_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new MondialRelayServiceError(
      `Réponse HTTP ${response.status} du service Mondial Relay.`,
    );
  }

  return response.text();
}

/** 1 nouvelle tentative sur erreur réseau/HTTP uniquement (jamais sur STAT d'erreur). */
async function postSoapWithRetry(
  body: string,
  context: string,
  soapAction: string,
): Promise<string> {
  try {
    return await postSoap(body, soapAction);
  } catch (error) {
    logSecure("warn", "mondial-relay: échec réseau, nouvelle tentative", {
      context,
      error: error instanceof Error ? error.message : String(error),
    });
    return postSoap(body, soapAction);
  }
}

/**
 * Appel WSI4_PointRelais_Recherche : hash de sécurité, timeout, retry, parsing,
 * log structuré des codes STAT. La clé privée n'apparaît jamais dans les logs.
 */
async function callWsi4(
  partialFields: Partial<Wsi4RequestFields>,
  context: string,
): Promise<Wsi4Response> {
  const brandId = getMondialRelayBrandId()!;
  const privateKey = process.env.MONDIAL_RELAY_PRIVATE_KEY!;

  const fields: Wsi4RequestFields = {
    Pays: "FR",
    NumPointRelais: "",
    Ville: "",
    CP: "",
    Latitude: "",
    Longitude: "",
    Taille: "",
    Poids: "",
    Action: "",
    DelaiEnvoi: "",
    RayonRecherche: "",
    TypeActivite: "",
    ...partialFields,
  };

  const security = buildSecurityHash(brandId, fields, privateKey);
  const xml = await postSoapWithRetry(
    buildSoapBody(brandId, fields, security),
    context,
    MR_SOAP_ACTION_WSI4_SEARCH,
  );
  const parsed = parseWsi4Response(xml);

  if (parsed.category === "configuration") {
    logSecure(
      "error",
      "mondial-relay: erreur de configuration — vérifier enseigne/clé privée",
      {
        context,
        stat: parsed.stat,
        statLabel: parsed.statLabel,
      },
    );
  } else if (parsed.category === "system") {
    logSecure("error", "mondial-relay: erreur système du service", {
      context,
      stat: parsed.stat,
      statLabel: parsed.statLabel,
    });
  } else if (parsed.category === "not_found") {
    logSecure("info", "mondial-relay: aucun résultat", {
      context,
      stat: parsed.stat,
      statLabel: parsed.statLabel,
    });
  }

  return parsed;
}

/** Le Num WSI4 est sur 6 chiffres (ex. "012417"). */
function normalizeRelayId(relayPointId: string): string {
  return relayPointId.trim().padStart(6, "0");
}

/* -------------------------------------------------------------------------- */
/* WSI2_CreationEtiquette — création d'expédition + étiquette PDF             */
/* -------------------------------------------------------------------------- */

/**
 * Champs WSI2_CreationEtiquette dans l'ordre imposé par la documentation MR.
 * Cet ordre détermine le calcul du hash de sécurité (champ « Texte » exclu
 * du hash par la doc — non envoyé ici car facultatif).
 */
interface Wsi2RequestFields {
  ModeCol: string;
  ModeLiv: string;
  NDossier: string;
  NClient: string;
  Expe_Langage: string;
  Expe_Ad1: string;
  Expe_Ad2: string;
  Expe_Ad3: string;
  Expe_Ad4: string;
  Expe_Ville: string;
  Expe_CP: string;
  Expe_Pays: string;
  Expe_Tel1: string;
  Expe_Tel2: string;
  Expe_Mail: string;
  Dest_Langage: string;
  Dest_Ad1: string;
  Dest_Ad2: string;
  Dest_Ad3: string;
  Dest_Ad4: string;
  Dest_Ville: string;
  Dest_CP: string;
  Dest_Pays: string;
  Dest_Tel1: string;
  Dest_Tel2: string;
  Dest_Mail: string;
  Poids: string;
  Longueur: string;
  Taille: string;
  NbColis: string;
  CRT_Valeur: string;
  CRT_Devise: string;
  Exp_Valeur: string;
  Exp_Devise: string;
  COL_Rel_Pays: string;
  COL_Rel: string;
  LIV_Rel_Pays: string;
  LIV_Rel: string;
  TAvisage: string;
  TReprise: string;
  Montage: string;
  TRDV: string;
  Assurance: string;
  Instructions: string;
}

const WSI2_FIELD_ORDER: readonly (keyof Wsi2RequestFields)[] = [
  "ModeCol",
  "ModeLiv",
  "NDossier",
  "NClient",
  "Expe_Langage",
  "Expe_Ad1",
  "Expe_Ad2",
  "Expe_Ad3",
  "Expe_Ad4",
  "Expe_Ville",
  "Expe_CP",
  "Expe_Pays",
  "Expe_Tel1",
  "Expe_Tel2",
  "Expe_Mail",
  "Dest_Langage",
  "Dest_Ad1",
  "Dest_Ad2",
  "Dest_Ad3",
  "Dest_Ad4",
  "Dest_Ville",
  "Dest_CP",
  "Dest_Pays",
  "Dest_Tel1",
  "Dest_Tel2",
  "Dest_Mail",
  "Poids",
  "Longueur",
  "Taille",
  "NbColis",
  "CRT_Valeur",
  "CRT_Devise",
  "Exp_Valeur",
  "Exp_Devise",
  "COL_Rel_Pays",
  "COL_Rel",
  "LIV_Rel_Pays",
  "LIV_Rel",
  "TAvisage",
  "TReprise",
  "Montage",
  "TRDV",
  "Assurance",
  "Instructions",
];

function buildWsi2SecurityHash(
  brandId: string,
  fields: Wsi2RequestFields,
  privateKey: string,
): string {
  const parts = [brandId, ...WSI2_FIELD_ORDER.map((key) => fields[key])];
  return createHash("md5")
    .update(parts.join("") + privateKey)
    .digest("hex")
    .toUpperCase();
}

function buildWsi2SoapBody(
  brandId: string,
  fields: Wsi2RequestFields,
  security: string,
): string {
  const xmlFields = WSI2_FIELD_ORDER.map(
    (key) => `      <${key}>${escapeXml(fields[key])}</${key}>`,
  ).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI2_CreationEtiquette xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${escapeXml(brandId)}</Enseigne>
${xmlFields}
      <Security>${security}</Security>
    </WSI2_CreationEtiquette>
  </soap:Body>
</soap:Envelope>`;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Charset adresses MR : ^[0-9A-Z_\-'., /]{n,32}$ — majuscules sans accents. */
function toMrAddressField(value: string | null | undefined, max = 32): string {
  return stripAccents(value ?? "")
    .toUpperCase()
    .replace(/[^0-9A-Z_\-'., /]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
}

/** Charset ville MR : ^[A-Z_\-' ]{2,26}$ */
function toMrCity(value: string): string {
  return stripAccents(value)
    .toUpperCase()
    .replace(/[^A-Z_\-' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 26)
    .trim();
}

/** Référence marchand NDossier : ^[0-9A-Z_ -]{0,15}$ */
function toMrReference(value: string): string {
  return stripAccents(value)
    .toUpperCase()
    .replace(/[^0-9A-Z_ -]/g, "")
    .slice(0, 15);
}

/** Téléphone FR attendu par MR : ^((00|\+)33|0)[0-9]{9}$ — vide si non conforme. */
function toMrPhone(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/[^\d+]/g, "");
  return /^((00|\+)33|0)[0-9]{9}$/.test(digits) ? digits : "";
}

function toMrZip(value: string): string {
  return value.replace(/\s/g, "").slice(0, 5);
}

const shipmentPartySchema = z.object({
  name: z.string().trim().min(2, "Nom requis (2 caractères min).").max(100),
  street: z.string().trim().min(2, "Adresse (rue) requise.").max(100),
  extra: z.string().trim().max(100).optional().nullable(),
  zip: z
    .string()
    .trim()
    .regex(/^\d{4,5}$/, "Code postal invalide."),
  city: z.string().trim().min(2, "Ville requise.").max(60),
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Code pays ISO à 2 lettres requis."),
  phone: z.string().trim().max(20).optional().nullable(),
  email: z.string().trim().email("E-mail invalide.").max(70).optional().nullable(),
});

const createShipmentLabelInputSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z.string().trim().min(1, "Référence commande requise.").max(40),
  sender: shipmentPartySchema,
  recipient: shipmentPartySchema,
  relayPointId: z
    .string()
    .trim()
    .regex(/^\d{1,6}$/, "Identifiant de point relais invalide."),
  relayPointCountry: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Pays du point relais invalide."),
  weightGrams: z
    .number()
    .int("Poids entier en grammes requis.")
    .min(15, "Poids minimal Mondial Relay : 15 g.")
    .max(9_999_999, "Poids invalide."),
  deliveryMode: z.enum(["24R", "24L"]).optional(),
});

interface MrPartyFields {
  ad1: string;
  ad3: string;
  ad4: string;
  ville: string;
  cp: string;
  pays: string;
  tel: string;
  mail: string;
}

function buildPartyFields(
  party: z.infer<typeof shipmentPartySchema>,
  role: "expéditeur" | "destinataire",
): MrPartyFields {
  const ad1 = toMrAddressField(party.name);
  const ad3 = toMrAddressField(party.street);
  const ville = toMrCity(party.city);
  const cp = toMrZip(party.zip);

  // Après sanitisation au charset MR, les champs obligatoires doivent rester valides.
  if (ad1.length < 2 || ad3.length < 2 || ville.length < 2 || !/^\d{4,5}$/.test(cp)) {
    throw new ShipmentLabelError(
      `Adresse ${role} incompatible avec le format Mondial Relay (nom, rue, ville ou code postal).`,
      "validation",
    );
  }

  return {
    ad1,
    ad3,
    ad4: toMrAddressField(party.extra),
    ville,
    cp,
    pays: party.country.toUpperCase(),
    tel: toMrPhone(party.phone),
    mail: party.email?.trim() ?? "",
  };
}

/** URL_Etiquette est retournée sans domaine ni protocole (doc MR). */
function toAbsoluteLabelUrl(rawUrl: string): string {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  return `${MR_LABEL_BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
}

export class MondialRelayApiProvider implements ShippingProvider {
  readonly name = "mondial_relay" as const;
  readonly carrier = "mondial_relay" as const;

  async searchRelayPoints(params: RelaySearchParams): Promise<RelaySearchResult> {
    if (!isMondialRelayApiConfigured()) {
      return {
        points: [],
        source: "mondial_relay_api",
        configured: false,
        message: "API Mondial Relay non configurée.",
      };
    }

    const parsed = await callWsi4(
      {
        Pays: params.country ?? "FR",
        Ville: params.city ?? "",
        CP: params.zip.replace(/\s/g, ""),
        Poids: params.weightGrams ? String(params.weightGrams) : "",
        RayonRecherche: "20",
      },
      "search",
    );

    if (parsed.category === "configuration") {
      return {
        points: [],
        source: "mondial_relay_api",
        configured: false,
        message: `Configuration Mondial Relay invalide (${parsed.statLabel}). Contactez l'administrateur de la boutique.`,
      };
    }

    if (parsed.category === "system") {
      throw new MondialRelayServiceError(
        `Service Mondial Relay indisponible (${parsed.statLabel}).`,
      );
    }

    // "ok" ou "not_found" (ex. ville inconnue) : réponse normale côté client.
    return {
      points: parsed.points,
      source: "mondial_relay_api",
      configured: true,
      message: parsed.points.length === 0 ? "Aucun point relais trouvé." : undefined,
    };
  }

  /**
   * Consultation directe d'un point relais par identifiant + pays
   * (WSI4_PointRelais_Recherche avec NumPointRelais renseigné — doc MR).
   * Ne lève jamais : les échecs réseau/système sont retournés en "unavailable".
   */
  async findRelayPoint(
    relayPointId: string,
    country: string,
  ): Promise<RelayLookupResult> {
    if (!isMondialRelayApiConfigured()) {
      return { status: "unconfigured" };
    }

    const normalizedId = normalizeRelayId(relayPointId);

    let parsed: Wsi4Response;
    try {
      parsed = await callWsi4(
        {
          Pays: country.toUpperCase(),
          NumPointRelais: normalizedId,
        },
        "lookup",
      );
    } catch (error) {
      logSecure("error", "mondial-relay: lookup direct injoignable", {
        context: "lookup",
        error: error instanceof Error ? error.message : String(error),
      });
      return { status: "unavailable" };
    }

    if (parsed.category === "configuration") {
      return { status: "configuration" };
    }

    if (parsed.category === "system") {
      return { status: "unavailable" };
    }

    if (parsed.category === "not_found") {
      return { status: "not_found" };
    }

    const point: RelayPoint | undefined = parsed.points.find(
      (candidate) => normalizeRelayId(candidate.id) === normalizedId,
    );

    return point ? { status: "found", point } : { status: "not_found" };
  }

  /**
   * Création d'expédition + étiquette PDF via WSI2_CreationEtiquette.
   * Mode : collecte chez le marchand (CCC), livraison point relais (24R).
   * Lève ShipmentLabelError (typée, message affichable côté admin).
   */
  async createShipmentLabel(input: CreateShipmentLabelInput): Promise<ShipmentLabel> {
    if (!isMondialRelayApiConfigured()) {
      throw new ShipmentLabelError(
        "API Mondial Relay non configurée (MONDIAL_RELAY_BRAND_ID / MONDIAL_RELAY_PRIVATE_KEY).",
        "configuration",
      );
    }

    const parsed = createShipmentLabelInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new ShipmentLabelError(
        parsed.error.issues[0]?.message ?? "Données d'expédition invalides.",
        "validation",
      );
    }

    const data = parsed.data;
    const sender = buildPartyFields(data.sender, "expéditeur");
    const recipient = buildPartyFields(data.recipient, "destinataire");

    const fields: Wsi2RequestFields = {
      ModeCol: "CCC",
      ModeLiv: data.deliveryMode ?? "24R",
      NDossier: toMrReference(data.orderNumber),
      NClient: "",
      Expe_Langage: "FR",
      Expe_Ad1: sender.ad1,
      Expe_Ad2: "",
      Expe_Ad3: sender.ad3,
      Expe_Ad4: sender.ad4,
      Expe_Ville: sender.ville,
      Expe_CP: sender.cp,
      Expe_Pays: sender.pays,
      Expe_Tel1: sender.tel,
      Expe_Tel2: "",
      Expe_Mail: sender.mail,
      Dest_Langage: "FR",
      Dest_Ad1: recipient.ad1,
      Dest_Ad2: "",
      Dest_Ad3: recipient.ad3,
      Dest_Ad4: recipient.ad4,
      Dest_Ville: recipient.ville,
      Dest_CP: recipient.cp,
      Dest_Pays: recipient.pays,
      Dest_Tel1: recipient.tel,
      Dest_Tel2: "",
      Dest_Mail: recipient.mail,
      Poids: String(data.weightGrams),
      Longueur: "",
      Taille: "",
      NbColis: "1",
      CRT_Valeur: "0",
      CRT_Devise: "",
      Exp_Valeur: "",
      Exp_Devise: "",
      COL_Rel_Pays: "",
      COL_Rel: "",
      LIV_Rel_Pays: data.relayPointCountry.toUpperCase(),
      LIV_Rel: normalizeRelayId(data.relayPointId),
      TAvisage: "",
      TReprise: "",
      Montage: "",
      TRDV: "",
      Assurance: "",
      Instructions: "",
    };

    const brandId = getMondialRelayBrandId()!;
    const privateKey = process.env.MONDIAL_RELAY_PRIVATE_KEY!;
    const security = buildWsi2SecurityHash(brandId, fields, privateKey);
    const body = buildWsi2SoapBody(brandId, fields, security);

    let xml: string;
    try {
      xml = await postSoapWithRetry(body, "label", MR_SOAP_ACTION_WSI2_LABEL);
    } catch (error) {
      logSecure("error", "mondial-relay: création étiquette injoignable", {
        context: "label",
        orderId: data.orderId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ShipmentLabelError(
        "Service Mondial Relay momentanément indisponible. Réessayez.",
        "unavailable",
      );
    }

    const stat = extractXmlValue(xml, "STAT");
    if (stat === null || stat === "") {
      logSecure("error", "mondial-relay: réponse étiquette illisible", {
        context: "label",
        orderId: data.orderId,
      });
      throw new ShipmentLabelError(
        "Réponse Mondial Relay illisible. Réessayez.",
        "unavailable",
      );
    }

    const category = categorizeWsi2LabelStat(stat);
    const statLabel = describeWsi2LabelStat(stat);

    if (category !== "ok") {
      logSecure(
        category === "configuration" ? "error" : "warn",
        "mondial-relay: échec création étiquette",
        {
          context: "label",
          orderId: data.orderId,
          stat,
          statLabel,
          category,
        },
      );

      if (category === "configuration") {
        throw new ShipmentLabelError(
          `Configuration Mondial Relay invalide (${statLabel}). Contactez l'administrateur.`,
          "configuration",
        );
      }
      if (category === "validation") {
        throw new ShipmentLabelError(
          `Mondial Relay a refusé l'expédition : ${statLabel}.`,
          "validation",
        );
      }
      throw new ShipmentLabelError(
        `Service Mondial Relay indisponible (${statLabel}). Réessayez.`,
        "unavailable",
      );
    }

    const shipmentNumber = extractXmlValue(xml, "ExpeditionNum") ?? "";
    const rawLabelUrl = extractXmlValue(xml, "URL_Etiquette") ?? "";

    if (!/^\d{8}$/.test(shipmentNumber) || !rawLabelUrl) {
      logSecure("error", "mondial-relay: réponse étiquette incomplète", {
        context: "label",
        orderId: data.orderId,
        hasShipmentNumber: Boolean(shipmentNumber),
        hasLabelUrl: Boolean(rawLabelUrl),
      });
      throw new ShipmentLabelError(
        "Réponse Mondial Relay incomplète (numéro ou étiquette manquant). Réessayez.",
        "unavailable",
      );
    }

    logSecure("info", "mondial-relay: étiquette créée", {
      context: "label",
      orderId: data.orderId,
      shipmentNumber,
    });

    return {
      shipmentNumber,
      labelUrl: toAbsoluteLabelUrl(rawLabelUrl),
    };
  }
}
