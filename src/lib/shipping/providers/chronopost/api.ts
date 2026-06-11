import "server-only";

import { logSecure } from "@/lib/security/log";
import {
  getChronopostAccountNumber,
  getChronopostPassword,
  isChronopostConfigured,
} from "@/lib/shipping/env";
import { ShipmentLabelError } from "@/lib/shipping/errors";
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
 * Recherche de points relais Pickup via le web service Chronopost
 * PointRelaisServiceWS (espace développeur chronopost.fr — « Web Services
 * Chronopost », §2.5 et §3.4/3.5).
 */
const CHRONOPOST_RELAY_ENDPOINT =
  "https://ws.chronopost.fr/recherchebt-ws-cxf/PointRelaisServiceWS";

const CHRONOPOST_TIMEOUT_MS = 8_000;
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

async function fetchChronopost(operation: string, params: URLSearchParams): Promise<string> {
  const url = `${CHRONOPOST_RELAY_ENDPOINT}/${operation}?${params.toString()}`;

  const doFetch = async (): Promise<string> => {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(CHRONOPOST_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ChronopostServiceError(
        `Réponse HTTP ${response.status} du service Chronopost.`,
      );
    }

    return response.text();
  };

  try {
    return await doFetch();
  } catch (firstError) {
    logSecure("warn", "chronopost: échec réseau, nouvelle tentative", {
      operation,
      error: firstError instanceof Error ? firstError.message : String(firstError),
    });
    return doFetch();
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

    const account = getChronopostAccountNumber()!;
    const password = getChronopostPassword()!;

    const query = new URLSearchParams({
      accountNumber: account,
      password,
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
      language: "FR",
      version: "2.0",
    });

    let parsed: ReturnType<typeof parseChronopostResponse>;

    try {
      const xml = await fetchChronopost("recherchePointChronopost", query);
      parsed = parseChronopostResponse(xml);
    } catch (error) {
      logSecure("error", "chronopost: recherche de points injoignable", {
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

  async findRelayPoint(relayPointId: string, country: string): Promise<PickupLookupResult> {
    if (!isChronopostConfigured()) {
      return { status: "unconfigured" };
    }

    const query = new URLSearchParams({
      accountNumber: getChronopostAccountNumber()!,
      password: getChronopostPassword()!,
      identifiant: relayPointId.trim(),
      countryCode: country.toUpperCase(),
      language: "FR",
    });

    let parsed: ReturnType<typeof parseChronopostResponse>;

    try {
      const xml = await fetchChronopost("rechercheDetailPointChronopost", query);
      parsed = parseChronopostResponse(xml);
    } catch (error) {
      logSecure("warn", "chronopost: consultation directe injoignable", {
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
        errorCode: describeChronopostError(parsed.errorCode),
      });
      return { status: "configuration" };
    }

    if (parsed.errorCode !== "0") {
      logSecure("warn", "chronopost: erreur applicative consultation directe", {
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
