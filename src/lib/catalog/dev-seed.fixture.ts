/**
 * Référence des produits insérés par `supabase/seed.dev-products.sql`.
 * ⛔ Données de démonstration — développement et recette locale uniquement.
 */

export const DEV_SEED_NOTICE =
  "Produits de démonstration Tilouki — développement uniquement, jamais en production.";

/** Slugs des 12 produits demo (2 par grande famille + petits prix). */
export const DEV_SEED_PRODUCT_SLUGS = [
  "body-bebe-coton-naturel",
  "gigoteuse-nuages-bebe",
  "robe-liberty-fleurie",
  "sweat-capuche-fille",
  "tshirt-dinosaure-garcon",
  "pantalon-jogger-garcon",
  "pyjama-etoiles",
  "pyjama-combi-hiver",
  "bonnet-doux-maille",
  "chaussettes-coton-lot3",
  "debardeur-fille-ete",
  "short-garcon-promo",
] as const;

export type DevSeedProductSlug = (typeof DEV_SEED_PRODUCT_SLUGS)[number];

export const DEV_SEED_CATEGORY_SLUGS = [
  "bebe",
  "fille",
  "garcon",
  "pyjamas",
  "accessoires",
] as const;

/** Produits attendus dans le filtre « petits prix » (badge ou promo). */
export const DEV_SEED_LOW_PRICE_SLUGS = [
  "debardeur-fille-ete",
  "chaussettes-coton-lot3",
  "short-garcon-promo",
] as const;

/** Préfixe SKU des variantes demo — permet de les purger sans toucher au catalogue réel. */
export const DEV_SEED_SKU_PREFIX = "DEV-";
