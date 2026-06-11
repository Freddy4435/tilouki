/**
 * Lien de suivi public Mondial Relay — utilisable côté client et serveur.
 * Format documenté : https://www.mondialrelay.fr/suivi-de-colis
 *   ?numeroExpedition={numéro 8 chiffres}&codePostal={CP destination}
 */
const MR_TRACKING_BASE_URL = "https://www.mondialrelay.fr/suivi-de-colis";

/**
 * Construit le lien de suivi public d'un colis Mondial Relay.
 * Retourne null si le numéro ne ressemble pas à un numéro d'expédition MR
 * (8 à 12 chiffres) — notamment pour les numéros factices "DEV-…".
 */
export function buildMondialRelayTrackingUrl(
  shipmentNumber: string | null | undefined,
  destinationZip?: string | null,
): string | null {
  const num = shipmentNumber?.trim() ?? "";
  if (!/^\d{8,12}$/.test(num)) return null;

  const params = new URLSearchParams({ numeroExpedition: num });
  const zip = destinationZip?.replace(/\s/g, "") ?? "";
  if (/^\d{4,5}$/.test(zip)) {
    params.set("codePostal", zip);
  }
  return `${MR_TRACKING_BASE_URL}?${params.toString()}`;
}

/**
 * Lien de suivi public Chronopost.
 * Format documenté : https://www.chronopost.fr/tracking-no-cms/suivi-page
 *   ?listeNumerosLT={numéro de suivi}
 */
const CHRONOPOST_TRACKING_BASE_URL =
  "https://www.chronopost.fr/tracking-no-cms/suivi-page";

export function buildChronopostTrackingUrl(
  trackingNumber: string | null | undefined,
): string | null {
  const num = trackingNumber?.trim().toUpperCase() ?? "";
  // Numéro de LT Chronopost : alphanumérique, 8 à 15 caractères (ex. XX123456789FR).
  if (!/^[A-Z0-9]{8,15}$/.test(num) || num.startsWith("DEV-")) return null;

  const params = new URLSearchParams({ listeNumerosLT: num });
  return `${CHRONOPOST_TRACKING_BASE_URL}?${params.toString()}`;
}

/**
 * Lien de suivi public selon le transporteur de la commande
 * (orders.shipping_provider). Retourne null si numéro absent ou invalide.
 */
export function buildCarrierTrackingUrl(
  shippingProvider: string | null | undefined,
  trackingNumber: string | null | undefined,
  destinationZip?: string | null,
): string | null {
  if (shippingProvider === "chronopost") {
    return buildChronopostTrackingUrl(trackingNumber);
  }
  return buildMondialRelayTrackingUrl(trackingNumber, destinationZip);
}

/** Libellé du transporteur pour les liens « Suivre mon colis … ». */
export function getCarrierTrackingLabel(
  shippingProvider: string | null | undefined,
): string {
  return shippingProvider === "chronopost" ? "Chronopost" : "Mondial Relay";
}
