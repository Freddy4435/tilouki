/** Réexporte le module livraison modulaire pour compatibilité panier. */
export {
  calculateRelayShippingCents,
  calculateShippingRate,
  computeCartWeightGrams,
  computeShippingCents,
  DEFAULT_ITEM_WEIGHT_GRAMS,
  DEFAULT_SHIPPING_RATES,
} from "@/lib/mondial-relay/rates";
