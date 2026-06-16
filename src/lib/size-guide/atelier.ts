import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";

export const ATELIER_AGE_IDS = [
  "0-3-mois",
  "3-12-mois",
  "1-3-ans",
  "4-8-ans",
] as const;

export type AtelierAgeId = (typeof ATELIER_AGE_IDS)[number];

export const ATELIER_USAGE_IDS = [
  "nuit",
  "quotidien",
  "sortie",
  "cadeau",
] as const;

export type AtelierUsageId = (typeof ATELIER_USAGE_IDS)[number];

export interface AtelierAgeBand {
  id: AtelierAgeId;
  label: string;
  /** Valeur filtre catalogue (alignée sur la navigation). */
  catalogueAge: string;
  shortLabel: string;
}

export interface AtelierUsage {
  id: AtelierUsageId;
  label: string;
  description: string;
}

export interface AtelierRecommendation {
  headline: string;
  sizeAdvice: string;
  marginAdvice: string;
  materials: string[];
  blogSlug: string;
  blogTitle: string;
}

export const ATELIER_AGE_BANDS: readonly AtelierAgeBand[] = [
  {
    id: "0-3-mois",
    label: "0-3 mois",
    catalogueAge: "0-3 mois",
    shortLabel: "Tout petit",
  },
  {
    id: "3-12-mois",
    label: "3-12 mois",
    catalogueAge: "3-12 mois",
    shortLabel: "Bébé mobile",
  },
  {
    id: "1-3-ans",
    label: "1-3 ans",
    catalogueAge: "1-3 ans",
    shortLabel: "Tout-petit",
  },
  {
    id: "4-8-ans",
    label: "4-8 ans",
    catalogueAge: "4-8 ans",
    shortLabel: "Enfant",
  },
] as const;

export const ATELIER_USAGES: readonly AtelierUsage[] = [
  {
    id: "nuit",
    label: "Nuit",
    description: "Pyjamas, bodies de nuit, pièces douces pour dormir.",
  },
  {
    id: "quotidien",
    label: "Quotidien",
    description: "École, maison, jeux — la garde-robe qui bouge souvent.",
  },
  {
    id: "sortie",
    label: "Sortie",
    description: "Balade, famille, photos — confortable mais un peu soigné.",
  },
  {
    id: "cadeau",
    label: "Cadeau",
    description: "Offrir sans stress : taille avec un peu de marge.",
  },
] as const;

export const ATELIER_DISCLAIMER =
  "Ces repères sont là pour vous aider à choisir sereinement. Ils ne remplacent pas l'essayage ni l'avis d'un professionnel de santé.";

const DEFAULT_AGE: AtelierAgeId = "3-12-mois";
const DEFAULT_USAGE: AtelierUsageId = "quotidien";

type RecommendationKey = `${AtelierAgeId}:${AtelierUsageId}`;

const RECOMMENDATIONS: Record<RecommendationKey, AtelierRecommendation> = {
  "0-3-mois:nuit": {
    headline: "Pour les nuits des tout-petits",
    sizeAdvice:
      "Privilégiez la taille en mois indiquée sur l'étiquette, en comparant avec un body qui va bien à plat.",
    marginAdvice:
      "Une coupe légèrement ample aide au change et laisse de la place pour la couche.",
    materials: ["Coton doux", "Molleton léger"],
    blogSlug: "indispensables-bebe-premiers-mois",
    blogTitle: "Les indispensables bébé des premiers mois",
  },
  "0-3-mois:quotidien": {
    headline: "Bodies et premières tenues",
    sizeAdvice:
      "Regardez surtout la longueur du body et l'aisance au niveau des épaules — c'est là que ça coince en premier.",
    marginAdvice:
      "Entre deux tailles en mois, la taille au-dessus est souvent plus confortable au quotidien.",
    materials: ["Coton", "Mélange coton doux"],
    blogSlug: "indispensables-bebe-premiers-mois",
    blogTitle: "Les indispensables bébé des premiers mois",
  },
  "0-3-mois:sortie": {
    headline: "Tenues douces pour sortir",
    sizeAdvice:
      "Même repère qu'au quotidien : la taille en mois, vérifiée sur une pièce déjà portée.",
    marginAdvice:
      "Un peu de marge au niveau du ventre rend les sorties plus agréables après le repas.",
    materials: ["Coton", "Maille fine"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
  "0-3-mois:cadeau": {
    headline: "Offrir pour un tout-petit",
    sizeAdvice:
      "Si vous hésitez, demandez la taille en mois actuelle ou montez d'un cran par rapport à l'âge.",
    marginAdvice:
      "Pour un cadeau, une taille légèrement grande est souvent mieux reçue qu'une pièce trop juste.",
    materials: ["Coton doux", "Matières faciles à laver"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
  "3-12-mois:nuit": {
    headline: "Nuits plus sereines",
    sizeAdvice:
      "Pyjama ou gigoteuse : vérifiez la longueur des jambes à plat, pieds inclus si la pièce les couvre.",
    marginAdvice:
      "Prévoyez de la liberté aux hanches et aux épaules pour les nuits agitées.",
    materials: ["Coton", "Molleton"],
    blogSlug: "choisir-pyjama-enfant-nuit-confortable",
    blogTitle: "Choisir un pyjama confortable",
  },
  "3-12-mois:quotidien": {
    headline: "Le quotidien d'un bébé qui bouge",
    sizeAdvice:
      "À cet âge, la croissance peut accélérer : comparez avec un pantalon ou un body récent.",
    marginAdvice:
      "Entre deux tailles, montez d'un cran pour les pièces portées plusieurs heures d'affilée.",
    materials: ["Coton", "Molleton léger", "Maille souple"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
  "3-12-mois:sortie": {
    headline: "Sorties en douceur",
    sizeAdvice:
      "Même taille qu'au quotidien, avec une attention aux manches si vous superposez un gilet.",
    marginAdvice:
      "Laissez un peu de jeu aux épaules pour enfiler et retirer sans tirer.",
    materials: ["Coton", "Maille douce"],
    blogSlug: "composer-tenue-enfant-simple-trois-pieces",
    blogTitle: "Composer une tenue en trois pièces",
  },
  "3-12-mois:cadeau": {
    headline: "Un cadeau utile et doux",
    sizeAdvice:
      "Taille en mois ou âge indiqué sur la fiche : en cas de doute, prenez la taille supérieure.",
    marginAdvice:
      "Les parents apprécient souvent une pièce qui pourra être portée un peu plus tard.",
    materials: ["Coton", "Molleton"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
  "1-3-ans:nuit": {
    headline: "Pyjamas pour tout-petits",
    sizeAdvice:
      "Regardez la longueur des jambes et l'aisance à l'entrejambe — l'enfant doit pouvoir s'asseoir librement.",
    marginAdvice:
      "Une taille un peu ample facilite l'habillage le soir et laisse de la marge pour grandir.",
    materials: ["Coton", "Molleton", "Maille douce"],
    blogSlug: "choisir-pyjama-enfant-nuit-confortable",
    blogTitle: "Choisir un pyjama confortable",
  },
  "1-3-ans:quotidien": {
    headline: "Tenues qui suivent le rythme",
    sizeAdvice:
      "Comparez manches et longueur de jambe avec un pantalon et un tee-shirt qui vont bien.",
    marginAdvice:
      "Pour jouer et s'accroupir, une coupe souple vaut mieux qu'une tenue juste « pour faire joli ».",
    materials: ["Coton", "Molleton", "Maille"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
  "1-3-ans:sortie": {
    headline: "Joli sans être fragile",
    sizeAdvice:
      "La taille en années indiquée sur l'étiquette, recoupée avec une tenue actuelle à plat.",
    marginAdvice:
      "Un peu de marge aux épaules suffit — inutile de prendre très grand pour une sortie.",
    materials: ["Coton", "Lin léger", "Maille"],
    blogSlug: "composer-tenue-enfant-simple-trois-pieces",
    blogTitle: "Composer une tenue en trois pièces",
  },
  "1-3-ans:cadeau": {
    headline: "Offrir à un enfant de 1 à 3 ans",
    sizeAdvice:
      "L'âge en années est un repère : demandez la taille portée ou montez d'un cran.",
    marginAdvice:
      "Pour un cadeau, la taille au-dessus laisse plus de chances que la pièce soit portée vite.",
    materials: ["Coton doux", "Molleton"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
  "4-8-ans:nuit": {
    headline: "Nuits calmes, grande taille",
    sizeAdvice:
      "Vérifiez la longueur du pyjama à plat : les jambes doivent arriver à la cheville sans tirer.",
    marginAdvice:
      "Un pyjama légèrement long se porte souvent bien ; trop court, il sera abandonné vite.",
    materials: ["Coton", "Molleton", "Maille"],
    blogSlug: "choisir-pyjama-enfant-nuit-confortable",
    blogTitle: "Choisir un pyjama confortable",
  },
  "4-8-ans:quotidien": {
    headline: "L'école et les jeux",
    sizeAdvice:
      "Épaules et longueur de manche sont vos meilleurs repères — comparez avec un sweat qui va bien.",
    marginAdvice:
      "À cet âge, une demi-taille de marge suffit souvent ; évitez le trop grand qui gêne le mouvement.",
    materials: ["Coton", "Molleton", "Maille résistante"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
  "4-8-ans:sortie": {
    headline: "Sorties en famille",
    sizeAdvice:
      "Taille habituelle : l'enfant doit pouvoir courir et s'asseoir sans que le pantalon remonte.",
    marginAdvice:
      "Pour une tenue de sortie, vous pouvez rester sur la taille portée — pas besoin de surdimensionner.",
    materials: ["Coton", "Lin", "Maille"],
    blogSlug: "composer-tenue-enfant-simple-trois-pieces",
    blogTitle: "Composer une tenue en trois pièces",
  },
  "4-8-ans:cadeau": {
    headline: "Offrir à un enfant de 4 à 8 ans",
    sizeAdvice:
      "Demandez la taille en années ou la pointure vestimentaire actuelle avant d'acheter.",
    marginAdvice:
      "Montez d'une taille si vous hésitez — mieux vaut un peu grand que trop juste.",
    materials: ["Coton", "Molleton", "Matières faciles d'entretien"],
    blogSlug: "choisir-bonne-taille-vetement-enfant",
    blogTitle: "Comment choisir la bonne taille",
  },
};

export function isAtelierAgeId(value: string | null | undefined): value is AtelierAgeId {
  return ATELIER_AGE_IDS.includes(value as AtelierAgeId);
}

export function isAtelierUsageId(
  value: string | null | undefined,
): value is AtelierUsageId {
  return ATELIER_USAGE_IDS.includes(value as AtelierUsageId);
}

export function parseAtelierSelection(
  params: Record<string, string | string[] | undefined>,
): { ageId: AtelierAgeId; usageId: AtelierUsageId } {
  const rawAge = Array.isArray(params.age) ? params.age[0] : params.age;
  const rawUsage = Array.isArray(params.usage) ? params.usage[0] : params.usage;

  return {
    ageId: isAtelierAgeId(rawAge) ? rawAge : DEFAULT_AGE,
    usageId: isAtelierUsageId(rawUsage) ? rawUsage : DEFAULT_USAGE,
  };
}

export function resolveAtelierRecommendation(
  ageId: AtelierAgeId,
  usageId: AtelierUsageId,
): AtelierRecommendation {
  const key = `${ageId}:${usageId}` as RecommendationKey;
  return RECOMMENDATIONS[key];
}

export function buildAtelierPageHref(
  ageId: AtelierAgeId,
  usageId: AtelierUsageId,
): string {
  const params = new URLSearchParams({ age: ageId, usage: usageId });
  return `/guide-tailles?${params.toString()}`;
}

export function buildAtelierCatalogueHref(
  ageId: AtelierAgeId,
  usageId: AtelierUsageId,
): string {
  const ageBand = ATELIER_AGE_BANDS.find((band) => band.id === ageId);
  const ages = ageBand ? [ageBand.catalogueAge] : undefined;

  switch (usageId) {
    case "nuit":
      return buildCategoryHref("pyjamas", { ages });
    case "quotidien":
      if (ageId === "0-3-mois" || ageId === "3-12-mois") {
        return buildCategoryHref("bebe", { ages });
      }
      return buildCatalogueHref({ ages, sort: "newest" });
    case "sortie":
      return buildCatalogueHref({ ages, sort: "newest" });
    case "cadeau":
      return buildCatalogueHref({ ages, sort: "newest" });
    default:
      return buildCatalogueHref({ ages, sort: "newest" });
  }
}

export function getAtelierAgeBand(ageId: AtelierAgeId): AtelierAgeBand {
  return ATELIER_AGE_BANDS.find((band) => band.id === ageId) ?? ATELIER_AGE_BANDS[1];
}

export function getAtelierUsage(usageId: AtelierUsageId): AtelierUsage {
  return ATELIER_USAGES.find((usage) => usage.id === usageId) ?? ATELIER_USAGES[1];
}
