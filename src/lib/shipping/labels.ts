export const SHIPPING_PROVIDER_LABELS: Record<string, string> = {
  mondial_relay: "Mondial Relay",
  chronopost: "Chronopost",
  dev_mock: "Mock développement",
};

export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  relay_point: "Point relais",
  shop2shop: "Shop2Shop",
};

export function formatShippingProvider(provider: string | null | undefined): string {
  if (!provider) return "—";
  return SHIPPING_PROVIDER_LABELS[provider] ?? provider;
}

export function formatShippingMethod(method: string | null | undefined): string {
  if (!method) return "—";
  return SHIPPING_METHOD_LABELS[method] ?? method;
}

/** Affiche une distance relais (mètres → « à 1,2 km » ou « à 350 m »). */
export function formatRelayDistance(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return "";
  if (distanceMeters >= 1000) {
    const km = distanceMeters / 1000;
    const formatted =
      km >= 10 ? Math.round(km).toString() : km.toFixed(1).replace(".", ",");
    return `à ${formatted} km`;
  }
  return `à ${Math.round(distanceMeters)} m`;
}
