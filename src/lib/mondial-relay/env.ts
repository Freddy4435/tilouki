function getMondialRelayBrandIdFromEnv(): string | undefined {
  return (
    process.env.MONDIAL_RELAY_BRAND_ID?.trim() ||
    process.env.MONDIAL_RELAY_ENSEIGNE?.trim() ||
    undefined
  );
}

export function isMondialRelayApiConfigured(): boolean {
  return Boolean(getMondialRelayBrandIdFromEnv() && process.env.MONDIAL_RELAY_PRIVATE_KEY?.trim());
}

/** Widget Mondial Relay (recherche carte) — clé publique côté client. */
export function getMondialRelayBrandId(): string | null {
  return (
    process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID?.trim() ??
    getMondialRelayBrandIdFromEnv() ??
    null
  );
}

export function isMondialRelayWidgetConfigured(): boolean {
  return Boolean(getMondialRelayBrandId());
}

/**
 * Mock dev activé uniquement en développement et si l'API MR n'est pas configurée.
 * Désactivable via SHIPPING_DEV_MOCK=false
 */
export function isDevMockShippingEnabled(): boolean {
  if (process.env.SHIPPING_DEV_MOCK === "false") return false;
  if (process.env.NODE_ENV === "production") return false;
  return !isMondialRelayApiConfigured();
}

/** @deprecated Utiliser isMondialRelayApiConfigured */
export const isMondialRelayConfigured = isMondialRelayApiConfigured;
