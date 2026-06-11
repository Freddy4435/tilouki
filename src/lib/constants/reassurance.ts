import {
  CreditCard,
  Heart,
  MapPin,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";

export interface ReassuranceItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
}

/** Microcopy courte — affichée en pills / bandeaux (prix livraison dynamique). */
export function getReassuranceMicrocopy(minShippingCents: number): ReassuranceItem[] {
  return [
    {
      id: "payment",
      icon: ShieldCheck,
      label: "Paiement sécurisé Stripe",
    },
    {
      id: "relay",
      icon: Truck,
      label: `Livraison point relais dès ${formatPrice(minShippingCents)}`,
    },
    {
      id: "returns",
      icon: RotateCcw,
      label: "Retours sous 14 jours",
    },
    {
      id: "france",
      icon: MapPin,
      label: "Boutique française",
    },
  ];
}

/** Blocs valeur page d'accueil */
export const HOME_VALUE_PROPS: ReassuranceItem[] = [
  {
    id: "relay",
    icon: Truck,
    label: "Livraison en point relais",
    description:
      "Choisissez le relais le plus pratique. Idéal pour récupérer votre colis quand vous le souhaitez.",
  },
  {
    id: "payment",
    icon: CreditCard,
    label: "Paiement sécurisé Stripe",
    description:
      "Règlement protégé par Stripe. Vos coordonnées bancaires ne sont jamais stockées sur notre site.",
  },
  {
    id: "stock",
    icon: PackageCheck,
    label: "Stock réel",
    description:
      "La disponibilité est affichée par taille. Le stock est mis à jour en temps réel à chaque commande.",
  },
  {
    id: "care",
    icon: Heart,
    label: "Vêtements sélectionnés avec soin",
    description:
      "Des pièces choisies pour le confort et la durabilité — pensées pour accompagner le quotidien des enfants.",
  },
];
