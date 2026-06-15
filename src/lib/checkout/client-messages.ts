/** Messages checkout — langage client, sans jargon technique. */

export const CHECKOUT_CLIENT_MESSAGES = {
  relayMissing:
    "Choisissez un point relais dans la liste ou sur la carte avant de continuer.",
  relayInvalid:
    "Le point relais sélectionné n'est plus valide. Lancez une nouvelle recherche.",
  relayMissingBeforePay:
    "Vous devez choisir un point relais avant de payer. Revenez à l'étape livraison.",
  cgvRequired: "Vous devez accepter les conditions générales de vente avant de payer.",
  stockChanged:
    "Le stock a changé : un article n'est plus disponible en quantité suffisante. Retournez au panier pour ajuster votre commande.",
  stockCheckFailed:
    "Impossible de vérifier le stock pour le moment. Vérifiez votre connexion et réessayez.",
  paymentUnavailable:
    "Le paiement est momentanément indisponible. Réessayez dans quelques minutes.",
  paymentNotConfigured:
    "Le paiement en ligne n'est pas encore activé sur cette boutique.",
  shippingUnavailable:
    "La livraison en point relais est temporairement indisponible. Réessayez plus tard ou contactez-nous.",
  relaySearchUnavailable:
    "La recherche de points relais est indisponible pour le moment. Réessayez plus tard.",
  relaySearchEmpty:
    "Aucun point relais trouvé pour cette zone. Essayez un code postal voisin.",
  networkError: "Connexion interrompue. Vérifiez votre réseau et réessayez.",
  rateLimited: "Trop de tentatives. Patientez une minute avant de réessayer.",
  genericPayment:
    "Impossible de lancer le paiement pour le moment. Réessayez ou contactez-nous si le problème persiste.",
} as const;

const SHIPPING_ERROR_PATTERN =
  /livraison|relais|mondial|chronopost|identifiants|expédition|expedition/i;
const PAYMENT_ERROR_PATTERN = /paiement|stripe|publication légale/i;
const STOCK_ERROR_PATTERN = /stock/i;
const RELAY_ERROR_PATTERN = /relais|point relais/i;

/** Traduit une réponse API checkout en message client. */
export function mapCheckoutApiError(status: number, apiError?: string): string {
  const message = apiError?.trim() ?? "";

  if (status === 429) {
    return CHECKOUT_CLIENT_MESSAGES.rateLimited;
  }

  if (status === 503) {
    if (
      message.includes("pas encore configuré") ||
      message.includes("n'est pas encore")
    ) {
      return CHECKOUT_CLIENT_MESSAGES.paymentNotConfigured;
    }
    if (PAYMENT_ERROR_PATTERN.test(message) && !SHIPPING_ERROR_PATTERN.test(message)) {
      return message || CHECKOUT_CLIENT_MESSAGES.paymentUnavailable;
    }
    if (SHIPPING_ERROR_PATTERN.test(message)) {
      return CHECKOUT_CLIENT_MESSAGES.shippingUnavailable;
    }
    return message || CHECKOUT_CLIENT_MESSAGES.paymentUnavailable;
  }

  if (status === 400) {
    if (STOCK_ERROR_PATTERN.test(message)) {
      return CHECKOUT_CLIENT_MESSAGES.stockChanged;
    }
    if (RELAY_ERROR_PATTERN.test(message)) {
      return CHECKOUT_CLIENT_MESSAGES.relayInvalid;
    }
    return message || CHECKOUT_CLIENT_MESSAGES.genericPayment;
  }

  return message || CHECKOUT_CLIENT_MESSAGES.genericPayment;
}

/** Message client pour l'échec de recherche de points relais. */
export function mapRelaySearchError(options: {
  configured: boolean;
  error?: string;
  hasResults: boolean;
}): string | null {
  if (!options.configured) {
    return CHECKOUT_CLIENT_MESSAGES.relaySearchUnavailable;
  }
  if (!options.hasResults) {
    if (options.error && SHIPPING_ERROR_PATTERN.test(options.error)) {
      return CHECKOUT_CLIENT_MESSAGES.relaySearchUnavailable;
    }
    return options.error ?? CHECKOUT_CLIENT_MESSAGES.relaySearchEmpty;
  }
  return null;
}
