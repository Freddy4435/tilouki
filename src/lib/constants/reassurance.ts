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

export interface ReassuranceMicrocopyOptions {
  minShippingCents: number;
  hasReturnPolicy?: boolean;
}

/** Microcopy courte — affichée en pills / bandeaux (aucune promesse non configurée). */
export function getReassuranceMicrocopy({
  minShippingCents,
  hasReturnPolicy = false,
}: ReassuranceMicrocopyOptions): ReassuranceItem[] {
  const items: ReassuranceItem[] = [
    {
      id: "payment",
      icon: ShieldCheck,
      label: "Paiement sécurisé Stripe",
    },
  ];

  if (minShippingCents > 0) {
    items.push({
      id: "relay",
      icon: Truck,
      label: `Livraison point relais dès ${formatPrice(minShippingCents)}`,
    });
  }

  if (hasReturnPolicy) {
    items.push({
      id: "returns",
      icon: RotateCcw,
      label: "Retours — voir conditions",
    });
  }

  items.push({
    id: "france",
    icon: MapPin,
    label: "Boutique française",
  });

  return items;
}

/** Blocs valeur page d'accueil — Pourquoi Tilouki */
export const HOME_VALUE_PROPS: ReassuranceItem[] = [
  {
    id: "stock",
    icon: PackageCheck,
    label: "Stock réel, taille par taille",
    description:
      "Vous voyez ce qui est disponible avant d'ajouter au panier. Fini les mauvaises surprises à la caisse.",
  },
  {
    id: "relay",
    icon: Truck,
    label: "Point relais près de chez vous",
    description:
      "Récupérez le colis quand ça vous arrange — pratique avec un bébé ou après l'école.",
  },
  {
    id: "care",
    icon: Heart,
    label: "Pièces choisies pour le quotidien",
    description:
      "Matières indiquées, entretien clair : des vêtements pensés pour durer aux goûters et aux siestes.",
  },
  {
    id: "payment",
    icon: CreditCard,
    label: "Paiement sécurisé",
    description:
      "Règlement protégé par Stripe. Vos coordonnées bancaires ne sont jamais stockées sur le site.",
  },
];
