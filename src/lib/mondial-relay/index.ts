export {
  calculateShippingRate,
  computeCartWeightGrams,
  computeShippingCents,
  DEFAULT_ITEM_WEIGHT_GRAMS,
  DEFAULT_SHIPPING_RATES,
} from "@/lib/mondial-relay/rates";

export {
  getMondialRelayBrandId,
  isDevMockShippingEnabled,
  isMondialRelayApiConfigured,
  isMondialRelayConfigured,
  isMondialRelayWidgetConfigured,
} from "@/lib/mondial-relay/env";

export { getShippingProvider, resetShippingProvider } from "@/lib/mondial-relay/provider";
export { getMondialRelayWidgetConfig } from "@/lib/mondial-relay/widget";

export type {
  MondialRelayWidgetConfig,
  RelayPoint,
  RelayPointSource,
  RelaySearchParams,
  RelaySearchResult,
  Shipment,
  ShipmentStatus,
  ShippingProvider,
  ShippingProviderName,
  ShippingRate,
  ShippingRateResult,
} from "@/lib/mondial-relay/types";
