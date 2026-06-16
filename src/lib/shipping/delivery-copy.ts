import { getShippingServiceForCarrier } from "@/lib/shipping/services";
import type { CarrierName } from "@/lib/shipping/types";

/** Texte légal — mode de livraison (CGV, page livraison/retours). */
export const LEGAL_DELIVERY_METHOD =
  "Les commandes sont expédiées depuis la France en point relais (Mondial Relay et/ou Chronopost selon votre choix lors de la commande), en France métropolitaine uniquement.";

/** Texte légal — calcul des frais (CGV, page livraison/retours). */
export const LEGAL_SHIPPING_FEES =
  "Les frais de livraison sont calculés automatiquement selon le poids total des articles et affichés en euros (€) avant validation définitive de la commande.";

/** Note affichée au checkout — délai indicatif après expédition. */
export const CHECKOUT_DELIVERY_DELAY_NOTE =
  "Délai indicatif après expédition depuis la France, hors délai de préparation de votre commande.";

/** Résumé des conditions de retour avant paiement. */
export const CHECKOUT_RETURN_SUMMARY =
  "Droit de rétractation de 14 jours à compter de la réception. Retours selon nos conditions (articles non portés, non lavés, étiquettes intactes).";

export function getCarrierEstimatedDelay(carrier: CarrierName): string {
  return getShippingServiceForCarrier(carrier).estimatedDelay;
}

export function getCarrierMethodLabel(carrier: CarrierName): string {
  return getShippingServiceForCarrier(carrier).methodLabel;
}

/** Paragraphe HTML pour les pages légales — aligné sur SHIPPING_SERVICES. */
export function buildLegalDeliveryDelaysHtml(): string {
  const items = [
    getShippingServiceForCarrier("mondial_relay"),
    getShippingServiceForCarrier("chronopost"),
  ].map(
    (service) =>
      `<li><strong>${service.label}</strong> (${service.methodLabel}) : délai indicatif <strong>${service.estimatedDelay}</strong> après expédition</li>`,
  );

  return `<p>Les délais suivants sont communiqués au client avant paiement et affichés lors de la commande :</p>
<ul>${items.join("")}</ul>
<p>Ils sont donnés à titre indicatif (préparation de commande + acheminement transporteur). Le vendeur ne saurait être tenu responsable des retards imputables au transporteur.</p>`;
}
