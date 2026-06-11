export const siteConfig = {
  name: "Tilouki",
  legalName: "Tilouki",
  domain: "tilouki.fr",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://tilouki.fr",
  description:
    "Boutique française de vêtements enfants, fille et garçon. Tee-shirts, sweats et essentiels du quotidien, livrés en point relais.",
  locale: "fr-FR",
  currency: "EUR",
} as const;

export const mainNavItems = [
  { label: "Accueil", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Suivi commande", href: "/suivi-commande" },
  { label: "Livraison & retours", href: "/livraison-retours" },
] as const;

export const footerNavItems = {
  boutique: [
    { label: "Catalogue", href: "/catalogue" },
    { label: "Panier", href: "/panier" },
    { label: "Commande", href: "/commande" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "CGV", href: "/cgv" },
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "Cookies", href: "/cookies" },
    { label: "Livraison & retours", href: "/livraison-retours" },
    { label: "Formulaire de rétractation", href: "/formulaire-retractation" },
    { label: "Données personnelles", href: "/donnees-personnelles" },
  ],
} as const;

export const adminNavItems = [
  { label: "Tableau de bord", href: "/admin", icon: "layout-dashboard" },
  { label: "Produits", href: "/admin/produits", icon: "shirt" },
  { label: "Import CSV", href: "/admin/import", icon: "upload" },
  { label: "Catégories", href: "/admin/categories", icon: "folder" },
  { label: "Commandes", href: "/admin/commandes", icon: "package" },
  { label: "Stock", href: "/admin/stock", icon: "warehouse" },
  { label: "Livraison", href: "/admin/livraison", icon: "truck" },
  { label: "Paramètres", href: "/admin/parametres", icon: "settings" },
  { label: "Pages légales", href: "/admin/pages-legales", icon: "file-text" },
] as const;
