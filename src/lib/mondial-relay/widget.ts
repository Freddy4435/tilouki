import type { MondialRelayWidgetConfig } from "@/lib/mondial-relay/types";

import { getMondialRelayBrandId, isMondialRelayWidgetConfigured } from "./env";

/**
 * Configuration widget Mondial Relay (V2).
 * Le widget charge la carte de sélection des points relais côté client.
 *
 * @see https://www.mondialrelay.fr/solutionspro/documentation-technique/
 */
export function getMondialRelayWidgetConfig(): MondialRelayWidgetConfig {
  return {
    enabled: isMondialRelayWidgetConfigured(),
    brandId: getMondialRelayBrandId(),
    defaultParcelSize: process.env.NEXT_PUBLIC_MONDIAL_RELAY_PARCEL_SIZE ?? "M",
  };
}
