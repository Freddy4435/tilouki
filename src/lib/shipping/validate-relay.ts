import "server-only";

import {
  getShippingConfigurationError,
  isRelayPointIdAllowed,
  isShippingConfiguredForCheckout,
} from "@/lib/shipping/checkout";
import { getShippingProvider } from "@/lib/shipping/provider";
import type { CarrierName } from "@/lib/shipping/types";
import { logSecure } from "@/lib/security/log";
import type { RelayPointInput } from "@/types/catalog";

export interface RelayValidationResult {
  valid: boolean;
  error?: string;
  /** true si l'échec vient d'une indisponibilité du service (réessayer plus tard). */
  unavailable?: boolean;
}

export const RELAY_VALIDATION_UNAVAILABLE_MESSAGE =
  "Vérification du point relais momentanément indisponible, réessayez.";

function normalizeZip(zip: string): string {
  return zip.replace(/\s/g, "");
}

/**
 * Vérifie que le point relais existe côté transporteur (anti-fraude checkout).
 */
export async function validateRelayPoint(
  relay: RelayPointInput,
  carrier: CarrierName = "mondial_relay",
): Promise<boolean> {
  const result = await validateRelayPointDetailed(relay, carrier);
  return result.valid;
}

/**
 * Validation en deux temps, via le provider du transporteur de la commande
 * (validation croisée : un point MR est refusé sur une commande Chronopost) :
 * 1. Consultation DIRECTE du point par identifiant —
 *    fiable, sans faux négatif lié au rayon de recherche.
 * 2. En secours uniquement (service indisponible) : recherche par code postal.
 */
export async function validateRelayPointDetailed(
  relay: RelayPointInput,
  carrier: CarrierName = "mondial_relay",
): Promise<RelayValidationResult> {
  if (!relay.id?.trim() || !relay.zip?.trim() || !relay.country?.trim()) {
    return {
      valid: false,
      error: "Point relais incomplet. Sélectionnez un point relais valide.",
    };
  }

  if (!isRelayPointIdAllowed(relay.id)) {
    return {
      valid: false,
      error:
        "Ce point relais n'est pas valide en production. Effectuez une nouvelle recherche.",
    };
  }

  if (!isShippingConfiguredForCheckout(carrier)) {
    return { valid: false, error: getShippingConfigurationError(carrier) };
  }

  const provider = getShippingProvider(carrier);

  // --- 1. Lookup direct par identifiant (si supporté par le provider) ---
  if (provider.findRelayPoint) {
    let lookupUnavailable = false;

    try {
      const lookup = await provider.findRelayPoint(relay.id, relay.country);

      switch (lookup.status) {
        case "found": {
          const point = lookup.point;
          if (
            point &&
            normalizeZip(point.zip) === normalizeZip(relay.zip) &&
            point.country.toUpperCase() === relay.country.toUpperCase()
          ) {
            return { valid: true };
          }
          // Point réel mais adresse incohérente avec la sélection (anti-fraude).
          return {
            valid: false,
            error:
              "Le point relais sélectionné ne correspond pas à l'adresse indiquée. Effectuez une nouvelle recherche.",
          };
        }
        case "not_found":
          return {
            valid: false,
            error: "Point relais introuvable. Sélectionnez-en un autre.",
          };
        case "configuration":
          return { valid: false, error: getShippingConfigurationError(carrier) };
        case "unconfigured":
          // Provider sans API directe : passer à la recherche par CP.
          break;
        case "unavailable":
          lookupUnavailable = true;
          break;
      }
    } catch (error) {
      // Le lookup ne doit pas bloquer la vente : secours par recherche CP.
      logSecure(
        "warn",
        "validate-relay: lookup direct en échec, secours recherche CP",
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
      lookupUnavailable = true;
    }

    if (lookupUnavailable) {
      logSecure(
        "warn",
        "validate-relay: lookup direct indisponible, secours recherche CP",
        {
          relayId: relay.id,
          zip: relay.zip,
        },
      );
    }
  }

  // --- 2. Secours : recherche par code postal (comportement historique) ---
  try {
    const result = await provider.searchRelayPoints({
      zip: relay.zip,
      country: relay.country,
      city: relay.city,
    });

    if (result.source === "dev_mock") {
      if (process.env.NODE_ENV === "production") {
        return {
          valid: false,
          error:
            "Les points relais de développement ne sont pas autorisés en production.",
        };
      }

      const matchesDevPoint = result.points.some((point) => point.id === relay.id);
      return matchesDevPoint
        ? { valid: true }
        : { valid: false, error: "Point relais introuvable. Relancez la recherche." };
    }

    if (!result.configured) {
      return { valid: false, error: result.message ?? getShippingConfigurationError(carrier) };
    }

    if (result.points.length === 0) {
      return {
        valid: false,
        error:
          "Point relais introuvable pour ce code postal. Sélectionnez-en un autre.",
      };
    }

    const match = result.points.find(
      (point) =>
        point.id === relay.id &&
        normalizeZip(point.zip) === normalizeZip(relay.zip) &&
        point.country.toUpperCase() === relay.country.toUpperCase(),
    );

    if (!match) {
      return {
        valid: false,
        error:
          "Le point relais sélectionné n'est plus disponible. Choisissez-en un autre.",
      };
    }

    return { valid: true };
  } catch (error) {
    logSecure(
      "error",
      "validate-relay: vérification impossible (service indisponible)",
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return {
      valid: false,
      error: RELAY_VALIDATION_UNAVAILABLE_MESSAGE,
      unavailable: true,
    };
  }
}
