import "server-only";

import {
  isChronopostConfigured,
  isDevMockShippingEnabled,
  isMondialRelayApiConfigured,
} from "@/lib/shipping/env";
import { SHIPPING_SERVICES } from "@/lib/shipping/services";
import type { CarrierInfo, CarrierName } from "@/lib/shipping/types";

/** Métadonnées affichables des transporteurs (ordre = ordre d'affichage). */
const CARRIER_METADATA: Record<CarrierName, Omit<CarrierInfo, "devMock">> =
  Object.fromEntries(
    SHIPPING_SERVICES.map((service) => [
      service.carrier,
      {
        id: service.carrier,
        label: service.label,
        methodLabel: service.methodLabel,
        estimatedDelay: service.estimatedDelay,
      },
    ]),
  ) as Record<CarrierName, Omit<CarrierInfo, "devMock">>;

const CARRIER_ORDER: CarrierName[] = ["mondial_relay", "chronopost"];

export function isKnownCarrier(value: string): value is CarrierName {
  return value === "mondial_relay" || value === "chronopost";
}

/** true si le transporteur est utilisable (API configurée ou mock dev). */
export function isCarrierConfigured(carrier: CarrierName): boolean {
  if (carrier === "chronopost") {
    return isChronopostConfigured() || isDevMockShippingEnabled();
  }
  return isMondialRelayApiConfigured() || isDevMockShippingEnabled();
}

/**
 * Transporteurs proposables à l'étape livraison, selon les variables d'env.
 * Sans CHRONOPOST_* : Mondial Relay seul — comportement historique.
 */
export function getAvailableCarriers(): CarrierInfo[] {
  const devMock = isDevMockShippingEnabled();

  return CARRIER_ORDER.filter((carrier) => isCarrierConfigured(carrier)).map(
    (carrier) => ({
      ...CARRIER_METADATA[carrier],
      devMock,
    }),
  );
}

export function getCarrierLabel(carrier: CarrierName): string {
  return CARRIER_METADATA[carrier].label;
}
