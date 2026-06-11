import "server-only";

import { isCarrierConfigured } from "@/lib/shipping/carriers";
import type { CarrierName } from "@/lib/shipping/types";

export const SHIPPING_PROVIDER_MONDIAL_RELAY = "mondial_relay" as const;
export const SHIPPING_METHOD_RELAY_POINT = "relay_point" as const;

const DEV_MOCK_ID_PREFIXES = ["DEV-MR-", "DEV-CHR-"];
const WIDGET_PLACEHOLDER_PREFIX = "WIDGET-PLACEHOLDER-";

/**
 * Identifiants de points relais interdits en production (mock / widget V2).
 */
export function isRelayPointIdAllowed(relayPointId: string): boolean {
  const id = relayPointId.trim();
  if (!id) return false;

  if (process.env.NODE_ENV === "production") {
    if (DEV_MOCK_ID_PREFIXES.some((prefix) => id.startsWith(prefix))) return false;
    if (id.startsWith(WIDGET_PLACEHOLDER_PREFIX)) return false;
    if (id.startsWith("[DEV]")) return false;
  }

  return true;
}

/**
 * Vérifie que la livraison point relais est utilisable pour le checkout
 * avec le transporteur demandé. En production : API réelle obligatoire.
 */
export function isShippingConfiguredForCheckout(
  carrier: CarrierName = "mondial_relay",
): boolean {
  return isCarrierConfigured(carrier);
}

export function getShippingConfigurationError(
  carrier: CarrierName = "mondial_relay",
): string {
  if (carrier === "chronopost") {
    return process.env.NODE_ENV === "production"
      ? "La livraison Chronopost relais n'est pas disponible. Les identifiants Chronopost doivent être configurés (CHRONOPOST_ACCOUNT_NUMBER et CHRONOPOST_PASSWORD)."
      : "Service Chronopost non configuré. Ajoutez les identifiants Chronopost ou utilisez le mode développement.";
  }

  if (process.env.NODE_ENV === "production") {
    return "La livraison en point relais n'est pas disponible. Les identifiants Mondial Relay doivent être configurés (MONDIAL_RELAY_BRAND_ID et MONDIAL_RELAY_PRIVATE_KEY).";
  }

  return "Service de points relais non configuré. Ajoutez les identifiants Mondial Relay ou utilisez le mode développement.";
}
