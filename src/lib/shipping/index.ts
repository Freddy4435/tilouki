export {
  calculateShippingRate,
  computeCartWeightGrams,
  computeShippingCents,
  DEFAULT_CHRONOPOST_RATES,
  DEFAULT_ITEM_WEIGHT_GRAMS,
  DEFAULT_SHIPPING_RATES,
  getDefaultRatesForCarrier,
} from "@/lib/shipping/rates";

export {
  getChronopostAccountNumber,
  getChronopostPassword,
  getMondialRelayBrandId,
  isChronopostConfigured,
  isChronopostQuickCostEnabled,
  isDevMockShippingEnabled,
  isMondialRelayApiConfigured,
  isMondialRelayConfigured,
  isMondialRelayWidgetConfigured,
} from "@/lib/shipping/env";

export { getShippingProvider, resetShippingProvider } from "@/lib/shipping/provider";
export {
  getShippingServiceForCarrier,
  getShippingServiceId,
  SHIPPING_SERVICES,
} from "@/lib/shipping/services";
export { getMondialRelayWidgetConfig } from "@/lib/shipping/providers/mondial-relay/widget";

export {
  buildCarrierTrackingUrl,
  buildChronopostTrackingUrl,
  buildMondialRelayTrackingUrl,
  getCarrierTrackingLabel,
} from "@/lib/shipping/tracking";

export type {
  Carrier,
  CarrierInfo,
  CarrierName,
  CreateShipmentLabelInput,
  MondialRelayWidgetConfig,
  PickupLookupResult,
  PickupPoint,
  PickupPointSource,
  PickupSearchParams,
  PickupSearchResult,
  Rate,
  RateQuote,
  RelayLookupResult,
  RelayPoint,
  RelayPointSource,
  RelaySearchParams,
  RelaySearchResult,
  Shipment,
  ShipmentLabel,
  ShipmentParty,
  ShipmentStatus,
  ShippingProvider,
  ShippingProviderName,
  ShippingRate,
  ShippingRateResult,
  ShippingService,
  ShippingServiceId,
} from "@/lib/shipping/types";

export { searchPickupPoints } from "@/lib/shipping/types";
