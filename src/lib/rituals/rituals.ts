import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";
import type { EditorialImageId } from "@/lib/media/editorial-images";

export interface Ritual {
  slug: string;
  title: string;
  description: string;
  imageId: EditorialImageId;
  /** Catégories catalogue pour suggérer des produits. */
  categorySlugs: readonly string[];
  blogSlugs: readonly string[];
  ctaLabel: string;
  catalogueHref: string;
  emptyStateTitle: string;
  emptyStateTips: readonly string[];
}

export const RITUALS: readonly Ritual[] = [
  {
    slug: "matin-presse",
    title: "Matin pressé",
    description:
      "Tee-shirt, jogging, chaussettes : l'essentiel qui s'enfile sans discussion avant l'école ou la garderie.",
    imageId: "ritual-morning",
    categorySlugs: ["garcon", "fille", "bebe"],
    blogSlugs: ["composer-tenue-enfant-simple-trois-pieces"],
    ctaLabel: "Voir le catalogue du matin",
    catalogueHref: buildCatalogueHref({ sort: "newest" }),
    emptyStateTitle: "Préparer un matin sans stress",
    emptyStateTips: [
      "Préparez la tenue la veille au soir — moins de décisions à 7 h.",
      "Privilégiez le coton et les élastiques souples pour s'habiller seul.",
      "Gardez une pièce de rechange dans le sac si l'enfant est en bas âge.",
    ],
  },
  {
    slug: "nuit-calme",
    title: "Nuit calme",
    description:
      "Pyjama moelleux, coupe ample, matières douces — pour des soirées un peu plus sereines.",
    imageId: "ritual-night-calm",
    categorySlugs: ["pyjamas", "bebe"],
    blogSlugs: ["choisir-pyjama-enfant-nuit-confortable"],
    ctaLabel: "Explorer les nuits douces",
    catalogueHref: buildCategoryHref("pyjamas"),
    emptyStateTitle: "Installer un rituel du soir",
    emptyStateTips: [
      "Même pyjama = repère rassurant : l'enfant sait que la journée s'arrête.",
      "Choisissez une taille légèrement ample pour bouger dans le lit.",
      "Coton ou molleton léger : agréable sans trop chauffer.",
    ],
  },
  {
    slug: "sortie-famille",
    title: "Sortie famille",
    description:
      "Une tenue complète, confortable pour bouger et jolie pour les photos du week-end.",
    imageId: "ritual-family-outing",
    categorySlugs: ["fille", "garcon", "accessoires"],
    blogSlugs: [
      "composer-tenue-enfant-simple-trois-pieces",
      "valise-week-end-enfant-vetements",
    ],
    ctaLabel: "Composer une tenue de sortie",
    catalogueHref: buildCatalogueHref({ sort: "newest" }),
    emptyStateTitle: "Partir léger, rester à l'aise",
    emptyStateTips: [
      "Trois pièces suffisent : haut, bas, veste ou gilet selon la météo.",
      "Prévoyez une couche en plus plutôt qu'une tenue trop habillée.",
      "Chaussures faciles à enfiler = moins de négociation au départ.",
    ],
  },
  {
    slug: "jour-de-pluie",
    title: "Jour de pluie",
    description:
      "Maille douce, couches chaudes, tenues qui sèchent vite — rester au sec sans sacrifier le confort.",
    imageId: "ritual-rainy-day",
    categorySlugs: ["fille", "garcon", "pyjamas"],
    blogSlugs: ["matieres-douces-vetements-enfants"],
    ctaLabel: "Voir les pièces cocooning",
    catalogueHref: buildCatalogueHref({ sort: "newest" }),
    emptyStateTitle: "Affronter la grisaille",
    emptyStateTips: [
      "Superposez maille + sweat : on retire une couche à l'intérieur.",
      "Évitez le trop volumineux sous la combinaison de pluie.",
      "Un pantalon qui sèche vite sauve les après-midis à la maison.",
    ],
  },
  {
    slug: "petit-budget",
    title: "Petit budget",
    description:
      "Les essentiels du quotidien à prix doux — pour compléter la garde-robe sans culpabiliser.",
    imageId: "colors-soft",
    categorySlugs: ["bebe", "fille", "garcon", "pyjamas"],
    blogSlugs: ["acheter-vetements-enfants-malin-petits-prix"],
    ctaLabel: "Voir les petits prix",
    catalogueHref: buildCatalogueHref({ promo: "petit-prix" }),
    emptyStateTitle: "Acheter malin, pas à la va-vite",
    emptyStateTips: [
      "Les basiques (tee-shirt, body, legging) sont les meilleurs achats utiles.",
      "Vérifiez la taille sur une pièce qui va bien avant de commander.",
      "Un petit prix n'a de sens que si le vêtement sera porté souvent.",
    ],
  },
] as const;

export type RitualSlug = (typeof RITUALS)[number]["slug"];

export function getAllRituals(): Ritual[] {
  return [...RITUALS];
}

export function getRitualBySlug(slug: string): Ritual | undefined {
  return RITUALS.find((ritual) => ritual.slug === slug);
}

export function getAllRitualSlugs(): RitualSlug[] {
  return RITUALS.map((ritual) => ritual.slug);
}

export function getPrimaryBlogSlug(ritual: Ritual): string {
  return ritual.blogSlugs[0] ?? "choisir-bonne-taille-vetement-enfant";
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
