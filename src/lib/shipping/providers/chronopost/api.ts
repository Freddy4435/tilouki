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
   * Génération automatique non implémentée (ShippingServiceWS shippingV6).
   * Utilisez l'enregistrement manuel depuis l'admin après création sur chronopost.fr.
   */
  async createShipmentLabel(input: CreateShipmentLabelInput): Promise<ShipmentLabel> {
    void input;
    throw new ShipmentLabelError(
      "La génération automatique d'étiquette Chronopost n'est pas encore disponible. Créez l'étiquette sur votre espace Chronopost, puis enregistrez le numéro de suivi dans l'admin.",
      "configuration",
    );
  }
}
