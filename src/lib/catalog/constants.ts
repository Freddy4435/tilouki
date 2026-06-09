import type { ProductSort } from "@/types/catalog";

export const CATALOGUE_PAGE_SIZE = 12;

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Nouveautés" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Nom A → Z" },
];

export const HOME_FAQ = [
  {
    question: "Comment passer commande ?",
    answer:
      "Choisissez vos articles, ajoutez-les au panier, renseignez vos coordonnées et sélectionnez un point relais. Le paiement est sécurisé via Stripe.",
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "Les commandes sont préparées depuis mon stock en France et expédiées en point relais. Les délais exacts sont indiqués lors du checkout.",
  },
  {
    question: "Puis-je retourner un article ?",
    answer:
      "Oui, vous disposez de 14 jours pour retourner un article non porté, conformément à nos conditions de retour.",
  },
  {
    question: "Le stock affiché est-il fiable ?",
    answer:
      "Oui, le stock est mis à jour en temps réel par taille. Si une taille n'est plus disponible, elle ne peut pas être commandée.",
  },
] as const;
