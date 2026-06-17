import type { ProductBadgeType } from "@/components/product/product-badges";
import type { ProductGender } from "@/types/database";

const CURATOR_SECTION_PATTERN =
  /(?:^|\n)#{1,3}\s*pourquoi\s+(?:on\s+)?l['']a\s+choisi[^\n]*\n+([\s\S]*?)(?=\n#{1,3}\s|$)/i;
const CURATOR_INLINE_PATTERN =
  /(?:^|\n)pourquoi\s+(?:on\s+)?l['']a\s+choisi\s*:\s*\n?([\s\S]*?)(?=\n\n|\n#{1,3}\s|$)/i;
const SELECTION_PATTERN = /sélection\s+tilouki|coup de cœur|notre choix/i;

export interface ProductCuratorContent {
  note: string;
  /** Description restante pour l'accordéon (sans le bloc curateur). */
  descriptionBody: string | null;
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function resolveProductCuratorContent(
  description: string | null | undefined,
  shortDescription: string | null | undefined,
): ProductCuratorContent | null {
  const full = normalizeText(description);
  if (!full) return null;

  const section =
    full.match(CURATOR_SECTION_PATTERN)?.[1]?.trim() ??
    full.match(CURATOR_INLINE_PATTERN)?.[1]?.trim();

  if (section && section.length >= 24) {
    const descriptionBody =
      full
        .replace(CURATOR_SECTION_PATTERN, "\n")
        .replace(CURATOR_INLINE_PATTERN, "\n")
        .trim() || null;
    return { note: section, descriptionBody };
  }

  const short = normalizeText(shortDescription);
  if (full.length >= 48 && full !== short) {
    const firstParagraph = full.split(/\n{2,}/)[0]?.trim() ?? full;
    if (firstParagraph.length >= 48 && firstParagraph !== short) {
      const rest = full.slice(firstParagraph.length).trim();
      return {
        note: firstParagraph,
        descriptionBody: rest || null,
      };
    }
  }

  return null;
}

export function deriveComfortNote(material: string | null | undefined): string | null {
  const value = material?.trim().toLowerCase();
  if (!value) return null;

  if (value.includes("coton bio")) {
    return "Coton bio doux et respirant — agréable sur les peaux sensibles.";
  }
  if (value.includes("coton")) {
    return "Coton souple et confortable pour le quotidien.";
  }
  if (value.includes("lin")) {
    return "Lin léger et respirant, idéal quand il fait doux.";
  }
  if (
    value.includes("molleton") ||
    value.includes("polaire") ||
    value.includes("fleece")
  ) {
    return "Matière moelleuse qui garde bien la chaleur.";
  }
  if (value.includes("maille") || value.includes("jersey")) {
    return "Maille extensible qui suit les mouvements de l'enfant.";
  }
  if (value.includes("velours")) {
    return "Velours doux au toucher, confortable en intérieur.";
  }

  return null;
}

export function resolveContextualSizeAdvice(product: {
  sizes: string[];
  ageLabels: string[];
  gender: ProductGender;
  material: string | null;
  secondHand?: boolean;
}): string {
  const ages = product.ageLabels.join(" ").toLowerCase();
  const sizes = product.sizes.join(" ").toLowerCase();

  if (product.secondHand) {
    return "Article seconde main : la taille indiquée correspond à l'étiquette d'origine. Mesurez si besoin (tour de poitrine ou hauteur) avant de commander.";
  }

  if (/mois|naissance|0-3|3-6|6-12|12-18|18-24/.test(ages + sizes)) {
    return "Bébé : suivez l'âge indiqué sur l'étiquette. Entre deux tailles, prenez la plus grande pour laisser de la marge à la croissance.";
  }

  if (product.sizes.length > 3) {
    return "Plusieurs tailles disponibles : si votre enfant est entre deux âges, privilégiez la taille au-dessus pour plus de confort.";
  }

  if (product.material?.toLowerCase().includes("coton")) {
    return "Le coton peut légèrement rétrécir au premier lavage — en cas de doute, choisissez la taille supérieure.";
  }

  return "Tailles alignées sur les étiquettes fabricant. Entre deux tailles, prenez la plus grande pour garder de la marge.";
}

/** Conseil taille court pour la fiche produit (une phrase). */
export function resolveBriefSizeTip(product: {
  sizes: string[];
  ageLabels: string[];
  gender: ProductGender;
  material: string | null;
  secondHand?: boolean;
}): string {
  const advice = resolveContextualSizeAdvice(product);
  const firstSentence = advice.split(/(?<=[.!?])\s+/)[0]?.trim();
  return firstSentence && firstSentence.length >= 16 ? firstSentence : advice;
}

export function isProductCuratedSelection(input: {
  badges: ProductBadgeType[];
  description: string | null;
  shortDescription: string | null;
}): boolean {
  if (input.badges.includes("new")) return true;
  const text = [input.description, input.shortDescription].filter(Boolean).join(" ");
  return SELECTION_PATTERN.test(text);
}

export function resolveProductConditionSummary(input: {
  secondHand: boolean;
  curatedSelection: boolean;
  defects: string[];
  material: string | null;
}): { title: string; intro: string } | null {
  if (!input.secondHand && !input.curatedSelection && input.defects.length === 0) {
    return null;
  }

  if (input.secondHand) {
    return {
      title: "Seconde main — état décrit",
      intro:
        "Article issu du circuit seconde main, inspecté et décrit avec transparence. Les photos et mentions ci-dessous reflètent l'état réel du vêtement.",
    };
  }

  if (input.curatedSelection) {
    return {
      title: "Sélection Tilouki",
      intro:
        "Pièce choisie pour sa qualité, son confort et son rapport qualité-prix. État conforme à une vente en boutique.",
    };
  }

  if (input.defects.length > 0) {
    return {
      title: "État du vêtement",
      intro: "Défauts visibles documentés en photo — aucune surprise à la réception.",
    };
  }

  return null;
}

const AUTONOMY_PYJAMA_PATTERN =
  /pyjama|gigoteuse|body|grenouillère|grenouillere|surpyjama|peignoir/i;
const AUTONOMY_EASY_DRESS_PATTERN =
  /velcro|élastique|elastique|élasthanne|elasthanne|jogging|legging|pantalon\s+élastiqué/i;
const AUTONOMY_CLOSURE_PATTERN = /bouton|zip|fermeture|pression/i;
const AUTONOMY_PLAY_PATTERN = /robe|jupe|short|tee|t-shirt|sweat/i;

/** Note parent sur l'autonomie de l'enfant — si le produit le justifie. */
export function deriveChildAutonomyNote(input: {
  name: string;
  categorySlug?: string | null;
  material?: string | null;
  careInstructions?: string | null;
}): string | null {
  const text = [input.name, input.categorySlug, input.material, input.careInstructions]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (AUTONOMY_PYJAMA_PATTERN.test(text)) {
    return "Fermetures pensées pour le change — votre enfant gagne en autonomie au fil des semaines.";
  }
  if (AUTONOMY_EASY_DRESS_PATTERN.test(text)) {
    return "Coupe souple et enfilage simple — facile à mettre seul dès 3–4 ans.";
  }
  if (AUTONOMY_CLOSURE_PATTERN.test(text)) {
    return "Fermeture accessible — idéal pour apprendre à s'habiller avec un peu d'aide.";
  }
  if (AUTONOMY_PLAY_PATTERN.test(text)) {
    return "Liberté de mouvement pour jouer, courir et s'asseoir à l'école sans gêne.";
  }

  return null;
}

export function resolveVariantSizeAdvice(
  variant: { sizeLabel: string | null; ageLabel: string | null } | null,
  product: {
    sizes: string[];
    ageLabels: string[];
    gender: ProductGender;
    material: string | null;
    secondHand?: boolean;
  },
): string {
  const base = resolveBriefSizeTip(product);
  if (!variant) return base;

  const label = variant.sizeLabel?.trim() || variant.ageLabel?.trim();
  if (!label) return base;

  const normalizedBase = base.charAt(0).toLowerCase() + base.slice(1);
  return `Taille ${label} — ${normalizedBase}`;
}
