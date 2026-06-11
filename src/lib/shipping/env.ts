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

/** Identifiants Chronopost (recherche points relais Pickup + QuickCost). */
export function getChronopostAccountNumber(): string | null {
  return process.env.CHRONOPOST_ACCOUNT_NUMBER?.trim() || null;
}

export function getChronopostPassword(): string | null {
  return process.env.CHRONOPOST_PASSWORD?.trim() || null;
}

export function isChronopostConfigured(): boolean {
  return Boolean(getChronopostAccountNumber() && getChronopostPassword());
}

/**
 * Cotation Chronopost via l'API QuickCost (opt-in).
 * Si absent ou false : barème DB par tranches de poids (comme Mondial Relay).
 */
export function isChronopostQuickCostEnabled(): boolean {
  return isChronopostConfigured() && process.env.CHRONOPOST_USE_QUICKCOST === "true";
}

/**
 * Mock dev activé uniquement en développement et si aucun transporteur réel
 * n'est configuré. Désactivable via SHIPPING_DEV_MOCK=false
 */
export function isDevMockShippingEnabled(): boolean {
  if (process.env.SHIPPING_DEV_MOCK === "false") return false;
  if (process.env.NODE_ENV === "production") return false;
  return !isMondialRelayApiConfigured() && !isChronopostConfigured();
}

/** @deprecated Utiliser isMondialRelayApiConfigured */
export const isMondialRelayConfigured = isMondialRelayApiConfigured;
