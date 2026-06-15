/** Assets marque — pack `tilouki_logo_pack_web` (public/brand). */
export const brandAssets = {
  header: {
    webp: "/brand/tilouki_logo_header_1200.webp",
    png: "/brand/tilouki_logo_header_1200.png",
    width: 1200,
    height: 471,
  },
  /** Pictogramme carré (favicon pack) — admin, espaces étroits. */
  mark: {
    png: "/brand/tilouki_favicon_192.png",
    width: 192,
    height: 192,
  },
  favicon: {
    ico: "/brand/tilouki_favicon.ico",
    png32: "/brand/tilouki_favicon_32.png",
    png64: "/brand/tilouki_favicon_64.png",
    png180: "/brand/tilouki_favicon_180.png",
    png192: "/brand/tilouki_favicon_192.png",
    png512: "/brand/tilouki_favicon_512.png",
  },
} as const;

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
  { label: "Le Carnet", href: "/blog" },
  { label: "Suivi commande", href: "/suivi-commande" },
  { label: "Livraison & retours", href: "/livraison-retours" },
] as const;

export const footerNavItems = {
  boutique: [
    { label: "Catalogue", href: "/catalogue" },
    { label: "Le Carnet", href: "/blog" },
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
  { label: "Préparation", href: "/admin/preparation", icon: "rocket" },
  { label: "Produits", href: "/admin/produits", icon: "shirt" },
  { label: "Import CSV", href: "/admin/import", icon: "upload" },
  { label: "Catégories", href: "/admin/categories", icon: "folder" },
  { label: "Commandes", href: "/admin/commandes", icon: "package" },
  { label: "Avis clients", href: "/admin/avis", icon: "message-square" },
  { label: "Stock", href: "/admin/stock", icon: "warehouse" },
  { label: "Livraison", href: "/admin/livraison", icon: "truck" },
  { label: "Paramètres", href: "/admin/parametres", icon: "settings" },
  { label: "Pages légales", href: "/admin/pages-legales", icon: "file-text" },
] as const;
