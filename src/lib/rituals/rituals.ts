import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";
import type { EditorialImageId } from "@/lib/media/editorial-images";

export interface RitualEmptyCta {
  label: string;
  href: string;
}

export interface Ritual {
  slug: string;
  title: string;
  /** Accroche catalogue — une phrase, orientée achat. */
  promise: string;
  description: string;
  imageId: EditorialImageId;
  /** Catégories catalogue pour la sélection produits. */
  categorySlugs: readonly string[];
  /** Mots-clés pour affiner la sélection (nom, description, catégorie). */
  productKeywords?: readonly string[];
  /** Catégorie principale — lien de repli si la sélection est vide. */
  primaryCategorySlug: string;
  primaryCategoryLabel: string;
  ctaLabel: string;
  catalogueHref: string;
  /** Aide courte sous les produits (une ligne). */
  shoppingTip: string;
  /** Message vide catalogue (une phrase). */
  emptyStateMessage: string;
  /** Boutons de repli quand aucun produit en ligne. */
  emptyStateCtas: readonly RitualEmptyCta[];
}

export const RITUALS: readonly Ritual[] = [
  {
    slug: "matin-presse",
    title: "Matin école",
    promise:
      "Hauts, bas et joggers prêts à enfiler — tailles affichées sur chaque fiche.",
    description: "Basiques et tenues du matin pour fille, garçon et bébé.",
    imageId: "ritual-morning",
    categorySlugs: ["garcon", "fille", "bebe"],
    productKeywords: [
      "jogger",
      "jogging",
      "tee",
      "t-shirt",
      "body",
      "basique",
      "sweat",
    ],
    primaryCategorySlug: "garcon",
    primaryCategoryLabel: "Garçon",
    ctaLabel: "Voir les basiques",
    catalogueHref: buildCatalogueHref({ sort: "newest" }),
    shoppingTip: "3 pièces suffisent : haut, bas, chaussettes.",
    emptyStateMessage: "Les basiques du matin complètent bientôt cette capsule.",
    emptyStateCtas: [
      { label: "Voir garçon", href: buildCategoryHref("garcon") },
      { label: "Voir fille", href: buildCategoryHref("fille") },
      { label: "Tout le catalogue", href: buildCatalogueHref({ sort: "newest" }) },
    ],
  },
  {
    slug: "nuit-calme",
    title: "Nuit douce",
    promise: "Pyjamas et ensembles nuit en stock — du 12 mois au 12 ans.",
    description: "Pyjamas fille, garçon et bébé pour des nuits confortables.",
    imageId: "ritual-night-calm",
    categorySlugs: ["pyjamas", "bebe"],
    productKeywords: ["pyjama", "nuit", "gigoteuse", "ensemble"],
    primaryCategorySlug: "pyjamas",
    primaryCategoryLabel: "Pyjamas",
    ctaLabel: "Voir les pyjamas",
    catalogueHref: buildCategoryHref("pyjamas"),
    shoppingTip: "Coupe ample : plus facile à enfiler le soir.",
    emptyStateMessage:
      "Les pyjamas arrivent bientôt — parcourez le rayon en attendant.",
    emptyStateCtas: [
      { label: "Voir les pyjamas", href: buildCategoryHref("pyjamas") },
      { label: "Voir bébé", href: buildCategoryHref("bebe") },
      { label: "Tout le catalogue", href: buildCatalogueHref() },
    ],
  },
  {
    slug: "bebe-cocon",
    title: "Bébé cocon",
    promise: "Bodies, pyjamas et essentiels bébé — tailles mois et ans.",
    description: "Bodies, pyjamas et gigoteuses pour les tout-petits.",
    imageId: "ritual-baby-cocoon",
    categorySlugs: ["bebe", "bodies", "pyjamas"],
    productKeywords: ["body", "gigoteuse", "pyjama", "combinaison", "grenouillère"],
    primaryCategorySlug: "bebe",
    primaryCategoryLabel: "Bébé",
    ctaLabel: "Voir bébé",
    catalogueHref: buildCategoryHref("bebe"),
    shoppingTip: "Prévoyez 2 bodies par jour de garde.",
    emptyStateMessage: "Les essentiels bébé arrivent avec le prochain arrivage.",
    emptyStateCtas: [
      { label: "Voir bébé", href: buildCategoryHref("bebe") },
      { label: "Voir les bodies", href: buildCategoryHref("bodies") },
      { label: "Voir les pyjamas", href: buildCategoryHref("pyjamas") },
    ],
  },
  {
    slug: "jour-de-pluie",
    title: "Jour de pluie",
    promise: "Couches chaudes, sweats et tenues pluie — rester au sec dehors.",
    description: "Vestes, sweats et pantalons pour les journées humides.",
    imageId: "ritual-rainy-day",
    categorySlugs: ["pluie", "garcon", "fille"],
    productKeywords: [
      "veste",
      "sweat",
      "pantalon",
      "botte",
      "imperméable",
      "pluie",
      "coupe-vent",
      "polaire",
    ],
    primaryCategorySlug: "pluie",
    primaryCategoryLabel: "Pluie",
    ctaLabel: "Voir la pluie",
    catalogueHref: buildCategoryHref("pluie"),
    shoppingTip: "Maille + sweat : une couche en moins à l'intérieur.",
    emptyStateMessage: "Les pièces pluie rejoignent le rayon très bientôt.",
    emptyStateCtas: [
      { label: "Voir la pluie", href: buildCategoryHref("pluie") },
      { label: "Voir fille", href: buildCategoryHref("fille") },
      { label: "Voir garçon", href: buildCategoryHref("garcon") },
    ],
  },
  {
    slug: "petit-budget",
    title: "Petits prix",
    promise: "Essentiels remisés du catalogue — prix affichés, tailles visibles.",
    description: "Bonnes affaires et essentiels à petit budget.",
    imageId: "colors-soft",
    categorySlugs: ["bebe", "fille", "garcon", "pyjamas"],
    primaryCategorySlug: "fille",
    primaryCategoryLabel: "Fille",
    ctaLabel: "Voir les petits prix",
    catalogueHref: buildCatalogueHref({ promo: "petit-prix" }),
    shoppingTip: "Bodies, tee-shirts et leggings : les basiques qui partent vite.",
    emptyStateMessage: "De nouvelles bonnes affaires sont en cours de mise en ligne.",
    emptyStateCtas: [
      {
        label: "Voir les petits prix",
        href: buildCatalogueHref({ promo: "petit-prix" }),
      },
      { label: "Tout le catalogue", href: buildCatalogueHref() },
    ],
  },
] as const;

export type RitualSlug = (typeof RITUALS)[number]["slug"];

/** Ordre vitrine accueil — modules shoppables. */
export const HOME_RITUAL_DISPLAY_ORDER = [
  "nuit-calme",
  "jour-de-pluie",
  "bebe-cocon",
  "matin-presse",
  "petit-budget",
] as const satisfies readonly RitualSlug[];

export function getAllRituals(): Ritual[] {
  return [...RITUALS];
}

export function getHomeRituals(): Ritual[] {
  return HOME_RITUAL_DISPLAY_ORDER.map((slug) => getRitualBySlug(slug)).filter(
    (ritual): ritual is Ritual => ritual != null,
  );
}

export function getRitualBySlug(slug: string): Ritual | undefined {
  return RITUALS.find((ritual) => ritual.slug === slug);
}

export function getAllRitualSlugs(): RitualSlug[] {
  return RITUALS.map((ritual) => ritual.slug);
}

/** Rituels mis en avant sur le catalogue vide (lancement). */
export const CATALOGUE_LAUNCH_RITUAL_SLUGS = [
  "matin-presse",
  "nuit-calme",
  "petit-budget",
] as const satisfies readonly RitualSlug[];

export function getRitualsForCatalogueLaunch(): Ritual[] {
  return CATALOGUE_LAUNCH_RITUAL_SLUGS.map((slug) => getRitualBySlug(slug)).filter(
    (ritual): ritual is Ritual => ritual != null,
  );
}
