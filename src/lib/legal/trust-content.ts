import {
  CreditCard,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Scale,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { ShopSettings } from "@/lib/shop/types";
import { formatPrice } from "@/lib/utils";

export interface FooterTrustLink {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  href?: string;
  external?: boolean;
}

export interface TrustSectionItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ShopTrustSignals {
  contactEmailConfigured: boolean;
  hasPhone: boolean;
  hasReturnPolicy: boolean;
  hasShippingRates: boolean;
  hasMediation: boolean;
  hasRepIdu: boolean;
  minShippingCents: number;
}

export function getShopTrustSignals(settings: ShopSettings): ShopTrustSignals {
  return {
    contactEmailConfigured: settings.contactEmailConfigured ?? false,
    hasPhone: Boolean(settings.phone?.trim()),
    hasReturnPolicy: Boolean(settings.returnPolicy?.trim()),
    hasShippingRates: settings.minShippingCents > 0,
    hasMediation: Boolean(settings.mediationUrl?.trim()),
    hasRepIdu: Boolean(settings.repIdu?.trim()),
    minShippingCents: settings.minShippingCents,
  };
}

/** Liens footer — uniquement les promesses vérifiables ou configurées. */
export function buildFooterTrustLinks(settings: ShopSettings): FooterTrustLink[] {
  const signals = getShopTrustSignals(settings);
  const links: FooterTrustLink[] = [];

  if (signals.contactEmailConfigured) {
    links.push({
      id: "contact-email",
      icon: Mail,
      label: "E-mail",
      description: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    });
  }

  if (signals.hasPhone && settings.phone) {
    const tel = settings.phone.replace(/\s/g, "");
    links.push({
      id: "contact-phone",
      icon: Phone,
      label: "Téléphone",
      description: settings.phone,
      href: `tel:${tel}`,
    });
  }

  if (signals.hasShippingRates) {
    links.push({
      id: "shipping",
      icon: Truck,
      label: "Livraison",
      description: `Point relais Mondial Relay dès ${formatPrice(signals.minShippingCents)}`,
      href: "/livraison-retours",
    });
  } else {
    links.push({
      id: "shipping-info",
      icon: Truck,
      label: "Livraison",
      description: "Délais et frais détaillés sur la page Livraison & retours",
      href: "/livraison-retours",
    });
  }

  links.push({
    id: "returns",
    icon: RotateCcw,
    label: "Retours",
    description: signals.hasReturnPolicy
      ? "Rétractation et retours — conditions sur la page dédiée"
      : "Conditions de retour et rétractation",
    href: "/livraison-retours",
  });

  links.push({
    id: "payment",
    icon: CreditCard,
    label: "Paiement",
    description:
      "Carte bancaire sécurisée via Stripe — aucune donnée stockée sur le site",
    href: "/cgv",
  });

  links.push({
    id: "legal",
    icon: Scale,
    label: "Mentions légales",
    description: "Identité vendeur, CGV et politique de confidentialité",
    href: "/mentions-legales",
  });

  if (signals.hasMediation && settings.mediationUrl) {
    links.push({
      id: "mediation",
      icon: Scale,
      label: "Médiation",
      description: settings.mediationName?.trim()
        ? `Médiateur : ${settings.mediationName}`
        : "Médiateur de la consommation",
      href: settings.mediationUrl,
      external: true,
    });
  }

  if (signals.hasRepIdu && settings.repIdu) {
    links.push({
      id: "rep",
      icon: MapPin,
      label: "REP textile",
      description: `Identifiant unique : ${settings.repIdu}`,
      href: "/mentions-legales",
    });
  }

  return links;
}

/** Blocs réassurance page — pas de promesse non configurée. */
export function buildTrustSectionItems(settings: ShopSettings): TrustSectionItem[] {
  const signals = getShopTrustSignals(settings);
  const items: TrustSectionItem[] = [
    {
      icon: CreditCard,
      title: "Paiement sécurisé",
      description:
        "Règlement protégé via Stripe. Aucune carte bancaire stockée sur Tilouki.",
    },
  ];

  if (signals.hasShippingRates) {
    items.push({
      icon: Truck,
      title: "Livraison point relais",
      description: `Retrait près de chez vous avec Mondial Relay — dès ${formatPrice(signals.minShippingCents)}.`,
    });
  }

  if (signals.hasReturnPolicy) {
    items.push({
      icon: RotateCcw,
      title: "Retours encadrés",
      description:
        "Rétractation et retours selon nos conditions — détaillées sur Livraison & retours.",
    });
  }

  items.push({
    icon: MapPin,
    title: "Stock affiché",
    description: "Disponibilité par taille mise à jour avant paiement.",
  });

  return items;
}
