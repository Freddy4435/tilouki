import type { Carrier, ShippingService, ShippingServiceId } from "@/lib/shipping/types";

/** Services de livraison proposés par la boutique (point retrait uniquement en V1). */
export const SHIPPING_SERVICES: readonly ShippingService[] = [
  {
    id: "relay_point",
    carrier: "mondial_relay",
    label: "Mondial Relay",
    methodLabel: "Point relais",
    estimatedDelay: "3 à 5 jours ouvrés",
  },
  {
    id: "relay_point",
    carrier: "chronopost",
    label: "Chronopost relais (Shop2Shop)",
    methodLabel: "Point relais Pickup",
    estimatedDelay: "2 à 3 jours ouvrés",
  },
] as const;

/** Service de livraison pour un transporteur donné. */
export function getShippingServiceForCarrier(carrier: Carrier): ShippingService {
  const service = SHIPPING_SERVICES.find((entry) => entry.carrier === carrier);
  if (!service) {
    throw new Error(`Aucun service de livraison pour le transporteur « ${carrier} ».`);
  }
  return service;
}

/** Identifiant du mode de livraison stocké en base (orders.shipping_method). */
export function getShippingServiceId(carrier: Carrier): ShippingServiceId {
  return getShippingServiceForCarrier(carrier).id;
}
