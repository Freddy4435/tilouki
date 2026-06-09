import type { ShopCategory, ShopSettings } from "./types";

export const defaultCategories: ShopCategory[] = [
  {
    slug: "bebe",
    label: "Bébé",
    href: "/categorie/bebe",
    description: "Naissance à 24 mois",
  },
  {
    slug: "fille",
    label: "Fille",
    href: "/categorie/fille",
  },
  {
    slug: "garcon",
    label: "Garçon",
    href: "/categorie/garcon",
  },
  {
    slug: "pyjamas",
    label: "Pyjamas",
    href: "/categorie/pyjamas",
  },
  {
    slug: "accessoires",
    label: "Accessoires",
    href: "/categorie/accessoires",
  },
  {
    slug: "soldes",
    label: "Petits prix",
    href: "/catalogue?promo=petit-prix",
  },
];

export const defaultShopSettings: ShopSettings = {
  name: "Tilouki",
  tagline: "Vêtements enfants avec soin",
  description:
    "Boutique française de vêtements enfants, fille et garçon. Tee-shirts, sweats et essentiels du quotidien, livrés en point relais.",
  primaryColor: "oklch(0.62 0.12 30)",
  contactEmail: "contact@tilouki.fr",
  categories: defaultCategories,
};
