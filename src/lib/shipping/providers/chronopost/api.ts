import "server-only";

import { logSecure } from "@/lib/security/log";
import {
  getChronopostAccountNumber,
  getChronopostPassword,
  isChronopostConfigured,
} from "@/lib/shipping/env";
import { ShipmentLabelError } from "@/lib/shipping/errors";
import {
  CHRONOPOST_RELAY_ENDPOINT,
  CHRONOPOST_RELAY_NAMESPACE,
  postChronopostSoap,
  sanitizeChronopostErrorMessage,
} from "@/lib/shipping/providers/chronopost/soap";
import {
  buildShippingV6Envelope,
  callShippingV6,
  parseShippingV6Response,
  pdfBase64ToDataUrl,
  validateChronopostLabelInput,
} from "@/lib/shipping/providers/chronopost/shipping-v6";
import {
  CHRONOPOST_ERROR_BAD_CREDENTIALS,
  CHRONOPOST_ERROR_NO_RESULT,
  describeChronopostError,
  parseChronopostResponse,
} from "@/lib/shipping/providers/chronopost/xml";
import type {
  CreateShipmentLabelInput,
  PickupLookupResult,
  PickupSearchParams,
  PickupSearchResult,
  ShipmentLabel,
  ShippingProvider,
} from "@/lib/shipping/types";

/**
 * Recherche de points relais Pickup — SOAP 1.1 POST (WSDL PointRelaisServiceWS).
 * Doc : espace développeur chronopost.fr → Web Services Chronopost, §2.5 / §3.4.
 * Les identifiants sont dans le corps XML, jamais dans l'URL (contrairement au GET legacy).
 */
const MAX_POINTS = 10;
const MAX_DISTANCE_KM = 20;

export class ChronopostServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChronopostServiceError";
  }
}

function formatShippingDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function relayCredentials(): Record<string, string> {
  return {
    accountNumber: getChronopostAccountNumber()!,
    password: getChronopostPassword()!,
  };
}

async function fetchChronopost(
  operation: string,
  fields: Record<string, string>,
): Promise<string> {
  try {
    return await postChronopostSoap({
      endpoint: CHRONOPOST_RELAY_ENDPOINT,
      namespace: CHRONOPOST_RELAY_NAMESPACE,
      operation,
      fields,
    });
  } catch (error) {
    const safeMessage =
      error instanceof Error
        ? sanitizeChronopostErrorMessage(error.message, fields)
        : "erreur réseau";
    throw new ChronopostServiceError(safeMessage);
  }
}

export class ChronopostApiProvider implements ShippingProvider {
  readonly name = "chronopost" as const;
  readonly carrier = "chronopost" as const;

  async searchRelayPoints(params: PickupSearchParams): Promise<PickupSearchResult> {
    if (!isChronopostConfigured()) {
      return {
        points: [],
        source: "chronopost_api",
        configured: false,
        message: "Identifiants Chronopost non configurés.",
      };
    }

    const credentials = relayCredentials();
    const body: Record<string, string> = {
      ...credentials,
      address: "",
      zipCode: params.zip.replace(/\s/g, ""),
      city: params.city?.trim() ?? "",
      countryCode: (params.country ?? "FR").toUpperCase(),
      type: "P",
      service: "L",
      weight: String(Math.max(params.weightGrams ?? 1000, 1)),
      shippingDate: formatShippingDate(new Date()),
      maxPointChronopost: String(MAX_POINTS),
      maxDistanceSearch: String(MAX_DISTANCE_KM),
      holidayTolerant: "1",
    };

    let parsed: ReturnType<typeof parseChronopostResponse>;

    try {
      const xml = await fetchChronopost("recherchePointChronopost", body);
      parsed = parseChronopostResponse(xml);
    } catch (error) {
      logSecure("error", "chronopost: recherche de points injoignable", {
        operation: "recherchePointChronopost",
        zip: params.zip,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ChronopostServiceError(
        "Service Chronopost momentanément indisponible.",
      );
    }

    if (parsed.errorCode === CHRONOPOST_ERROR_NO_RESULT) {
      return {
        points: [],
        source: "chronopost_api",
        configured: true,
        message: "Aucun point relais Chronopost trouvé pour ce code postal.",
      };
    }

    if (parsed.errorCode !== "0") {
      logSecure("error", "chronopost: erreur applicative recherche de points", {
        operation: "recherchePointChronopost",
        errorCode: describeChronopostError(parsed.errorCode),
        zip: params.zip,
      });

      if (parsed.errorCode === CHRONOPOST_ERROR_BAD_CREDENTIALS) {
        return {
          points: [],
          source: "chronopost_api",
          configured: false,
          message:
            "Configuration Chronopost invalide. Contactez l'administrateur de la boutique.",
        };
      }

      throw new ChronopostServiceError(
        `Erreur Chronopost ${describeChronopostError(parsed.errorCode)}.`,
      );
    }

    return {
      points: parsed.points,
      source: "chronopost_api",
      configured: true,
    };
  }

  async findRelayPoint(
    relayPointId: string,
    country: string,
  ): Promise<PickupLookupResult> {
    void country;

    if (!isChronopostConfigured()) {
      return { status: "unconfigured" };
    }

    const body: Record<string, string> = {
      ...relayCredentials(),
      identifiant: relayPointId.trim(),
    };

    let parsed: ReturnType<typeof parseChronopostResponse>;

    try {
      const xml = await fetchChronopost("rechercheDetailPointChronopost", body);
      parsed = parseChronopostResponse(xml);
    } catch (error) {
      logSecure("warn", "chronopost: consultation directe injoignable", {
        operation: "rechercheDetailPointChronopost",
        relayPointId,
        error: error instanceof Error ? error.message : String(error),
      });
      return { status: "unavailable" };
    }

    if (parsed.errorCode === CHRONOPOST_ERROR_NO_RESULT) {
      return { status: "not_found" };
    }

    if (parsed.errorCode === CHRONOPOST_ERROR_BAD_CREDENTIALS) {
      logSecure("error", "chronopost: identifiants invalides (consultation directe)", {
        operation: "rechercheDetailPointChronopost",
        errorCode: describeChronopostError(parsed.errorCode),
      });
      return { status: "configuration" };
    }

    if (parsed.errorCode !== "0") {
      logSecure("warn", "chronopost: erreur applicative consultation directe", {
        operation: "rechercheDetailPointChronopost",
        errorCode: describeChronopostError(parsed.errorCode),
        relayPointId,
      });
      return { status: "unavailable" };
    }

    const point = parsed.points[0];
    if (!point) {
      return { status: "not_found" };
    }

    return { status: "found", point };
  }

  /**
   * Génération d'étiquette Chrono Relais via ShippingServiceWS / shippingV6.
   * productCode 86 — recipientRef = identifiant point relais Pickup.
   */
  async createShipmentLabel(input: CreateShipmentLabelInput): Promise<ShipmentLabel> {
    if (!isChronopostConfigured()) {
      throw new ShipmentLabelError(
        "API Chronopost non configurée (CHRONOPOST_ACCOUNT_NUMBER / CHRONOPOST_PASSWORD).",
        "configuration",
      );
    }

    const parsed = validateChronopostLabelInput(input);
    if (!parsed.success) {
      throw new ShipmentLabelError(
        parsed.error.issues[0]?.message ?? "Données d'expédition invalides.",
        "validation",
      );
    }

    const data = parsed.data;
    const accountNumber = getChronopostAccountNumber()!;
    const password = getChronopostPassword()!;
    const credentials = { accountNumber, password };

    const envelope = buildShippingV6Envelope({
      ...data,
      accountNumber,
      password,
    });

    let xml: string;
    try {
      xml = await callShippingV6(envelope, credentials);
    } catch (error) {
      logSecure("error", "chronopost: création étiquette injoignable", {
        operation: "shippingV6",
        orderId: data.orderId,
        error:
          error instanceof Error
            ? sanitizeChronopostErrorMessage(error.message, credentials)
            : "erreur réseau",
      });
      throw new ShipmentLabelError(
        "Service Chronopost momentanément indisponible. Réessayez.",
        "unavailable",
      );
    }

    const result = parseShippingV6Response(xml);

    if (result.errorCode !== "0") {
      const detail = result.errorMessage?.trim() || describeChronopostError(result.errorCode);
      logSecure("warn", "chronopost: échec création étiquette", {
        operation: "shippingV6",
        orderId: data.orderId,
        errorCode: result.errorCode,
        errorMessage: detail,
      });

      if (result.errorCode === CHRONOPOST_ERROR_BAD_CREDENTIALS || result.errorCode === "29" || result.errorCode === "33") {
        throw new ShipmentLabelError(
          "Configuration Chronopost invalide. Vérifiez le numéro de contrat et le mot de passe API.",
          "configuration",
        );
      }

      throw new ShipmentLabelError(
        `Chronopost a refusé l'expédition : ${detail}.`,
        "validation",
      );
    }

    const shipmentNumber = result.skybillNumber?.trim() ?? "";
    if (!shipmentNumber) {
      logSecure("error", "chronopost: réponse étiquette incomplète", {
        operation: "shippingV6",
        orderId: data.orderId,
        hasPdf: Boolean(result.pdfBase64),
      });
      throw new ShipmentLabelError(
        "Réponse Chronopost incomplète (numéro de suivi manquant). Réessayez.",
        "unavailable",
      );
    }

    const pdfBase64 = result.pdfBase64?.trim() ?? "";
    if (!pdfBase64) {
      throw new ShipmentLabelError(
        "Réponse Chronopost incomplète (PDF étiquette manquant). Réessayez.",
        "unavailable",
      );
    }

    logSecure("info", "chronopost: étiquette créée", {
      operation: "shippingV6",
      orderId: data.orderId,
      shipmentNumber,
    });

    return {
      shipmentNumber,
      labelUrl: pdfBase64ToDataUrl(pdfBase64),
    };
  }
}
