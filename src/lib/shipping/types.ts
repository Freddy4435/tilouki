/**
 * Modèle de livraison multi-transporteurs.
 *
 * Nomenclature canonique : Carrier, ShippingService, PickupPoint, Rate.
 * Les alias Relay* sont conservés pour la compatibilité du code existant.
 */

/** Transporteur commercial (valeur stockée dans orders.shipping_provider). */
export type Carrier = "mondial_relay" | "chronopost";

/** @alias Carrier — nom historique utilisé dans le code existant. */
export type CarrierName = Carrier;

export type ShippingProviderName = Carrier | "dev_mock" | "unconfigured";

/** Mode de livraison (ex. point retrait). Stocké dans orders.shipping_method. */
export type ShippingServiceId = "relay_point";

/** Service de livraison proposable pour un transporteur. */
export interface ShippingService {
  id: ShippingServiceId;
  carrier: Carrier;
  label: string;
  methodLabel: string;
  estimatedDelay: string;
}

export type PickupPointSource =
  | "mondial_relay_api"
  | "chronopost_api"
  | "dev_mock"
  | "widget";

/** @alias PickupPointSource */
export type RelayPointSource = PickupPointSource;

/** Transporteur disponible à l'étape livraison (métadonnées affichables). */
export interface CarrierInfo {
  id: Carrier;
  label: string;
  methodLabel: string;
  estimatedDelay: string;
  devMock: boolean;
}

export type ShipmentStatus =
  | "pending_label"
  | "label_created"
  | "shipped"
  | "delivered";

/** Point de retrait (relais Pickup / Shop2Shop). */
export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  /** Distance en mètres depuis l'origine de recherche (WSI4 Mondial Relay). */
  distanceMeters?: number;
  openingHours?: string;
  isDevMock?: boolean;
}

/** @alias PickupPoint — nom historique du domaine checkout. */
export type RelayPoint = PickupPoint;

export interface PickupSearchParams {
  zip: string;
  country?: string;
  city?: string;
  weightGrams?: number;
}

/** @alias PickupSearchParams */
export type RelaySearchParams = PickupSearchParams;

export interface PickupSearchResult {
  points: PickupPoint[];
  source: PickupPointSource;
  configured: boolean;
  message?: string;
}

/** @alias PickupSearchResult */
export type RelaySearchResult = PickupSearchResult;

/** Tranche tarifaire livraison (configurable en base). */
export interface Rate {
  id?: string;
  /** Transporteur associé à la tranche (colonne provider en base). */
  carrier?: Carrier;
  /** @deprecated Utiliser carrier */
  provider?: string;
  label: string;
  minWeightGrams: number;
  maxWeightGrams: number;
  priceCents: number;
  sortOrder?: number;
}

/** @alias Rate */
export type ShippingRate = Rate;

export interface RateQuote {
  rate: Rate;
  priceCents: number;
  totalWeightGrams: number;
}

/** @alias RateQuote */
export type ShippingRateResult = RateQuote;

export interface Shipment {
  orderId: string;
  relayPoint: PickupPoint;
  totalWeightGrams: number;
  shippingCents: number;
  trackingNumber?: string | null;
  labelUrl?: string | null;
  status: ShipmentStatus;
}

export interface ShipmentParty {
  name: string;
  street: string;
  extra?: string | null;
  zip: string;
  city: string;
  country: string;
  phone?: string | null;
  email?: string | null;
}

export interface CreateShipmentLabelInput {
  orderId: string;
  orderNumber: string;
  sender: ShipmentParty;
  recipient: ShipmentParty;
  relayPointId: string;
  relayPointCountry: string;
  weightGrams: number;
  deliveryMode?: "24R" | "24L";
}

export interface ShipmentLabel {
  shipmentNumber: string;
  labelUrl: string;
  /** Chemin storage d'un PDF archivé (optionnel). */
  labelPdfPath?: string | null;
  isDevMock?: boolean;
}

export interface MondialRelayWidgetConfig {
  enabled: boolean;
  brandId: string | null;
  defaultParcelSize?: string;
}

export type PickupLookupStatus =
  | "found"
  | "not_found"
  | "configuration"
  | "unavailable"
  | "unconfigured";

/** @alias PickupLookupStatus */
export type RelayLookupStatus = PickupLookupStatus;

export interface PickupLookupResult {
  status: PickupLookupStatus;
  point?: PickupPoint;
}

/** @alias PickupLookupResult */
export type RelayLookupResult = PickupLookupResult;

/**
 * Contrat d'un provider de livraison par transporteur.
 * Méthodes searchRelayPoints / findRelayPoint : alias historiques pour les points de retrait.
 */
export interface ShippingProvider {
  readonly name: ShippingProviderName;
  readonly carrier: Carrier;
  searchRelayPoints(params: PickupSearchParams): Promise<PickupSearchResult>;
  findRelayPoint?(relayPointId: string, country: string): Promise<PickupLookupResult>;
  createShipmentLabel?(input: CreateShipmentLabelInput): Promise<ShipmentLabel>;
}

/** Délègue searchRelayPoints — nomenclature canonique pickup. */
export function searchPickupPoints(
  provider: ShippingProvider,
  params: PickupSearchParams,
): Promise<PickupSearchResult> {
  return provider.searchRelayPoints(params);
}
