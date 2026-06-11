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
