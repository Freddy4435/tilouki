export type ShippingProviderName = "mondial_relay" | "dev_mock" | "unconfigured";

export type RelayPointSource = "mondial_relay_api" | "dev_mock" | "widget";

export type ShipmentStatus = "pending_label" | "label_created" | "shipped" | "delivered";

/** Point relais sélectionné par le client. */
export interface RelayPoint {
  id: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  /** true uniquement pour les points générés en environnement de développement */
  isDevMock?: boolean;
}

export interface RelaySearchParams {
  zip: string;
  country?: string;
  city?: string;
  /** Poids total du colis en grammes (pour filtrage futur / widget). */
  weightGrams?: number;
}

export interface RelaySearchResult {
  points: RelayPoint[];
  source: RelayPointSource;
  configured: boolean;
  message?: string;
}

/** Tranche tarifaire livraison (configurable en base). */
export interface ShippingRate {
  id?: string;
  provider?: string;
  label: string;
  minWeightGrams: number;
  maxWeightGrams: number;
  priceCents: number;
  sortOrder?: number;
}

export interface ShippingRateResult {
  rate: ShippingRate;
  priceCents: number;
  totalWeightGrams: number;
}

/**
 * Expédition liée à une commande.
 * V2 : labelUrl et trackingNumber seront remplis via l'API Mondial Relay.
 */
export interface Shipment {
  orderId: string;
  relayPoint: RelayPoint;
  totalWeightGrams: number;
  shippingCents: number;
  trackingNumber?: string | null;
  labelUrl?: string | null;
  status: ShipmentStatus;
}

export interface MondialRelayWidgetConfig {
  enabled: boolean;
  brandId: string | null;
  /** Colis — codes Mondial Relay (ex. M pour Medium) */
  defaultParcelSize?: string;
}

/**
 * Contrat provider livraison — V1 recherche points relais, V2 étiquettes.
 */
export interface ShippingProvider {
  readonly name: ShippingProviderName;
  searchRelayPoints(params: RelaySearchParams): Promise<RelaySearchResult>;
  /** V2 — génération étiquette Mondial Relay */
  createShipmentLabel?(_shipment: Shipment): Promise<Shipment>;
}
