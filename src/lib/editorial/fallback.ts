import { isRealEditorialImage } from "@/lib/editorial/images";
import type { EditorialBlock } from "@/lib/editorial/types";
import type { Category } from "@/types/catalog";

const FALLBACK_HOOKS: Record<string, string> = {
  bebe: "Bodies moelleux et gigoteuses pour les premiers câlins — pensés pour le change du quotidien.",
  fille: "Robes légères et essentiels faciles à mixer, du mercredi au week-end.",
  garcon:
    "Tee-shirts solides et joggers confortables pour suivre le rythme des aventures.",
  pyjamas:
    "Des nuits plus douces avec des pyjamas faciles à enfiler, même quand on a sommeil.",
  accessoires:
    "Bonnet, chaussettes et petits indispensables pour compléter la garde-robe.",
};

const CATEGORY_SURFACE_LABELS: Record<string, string> = {
  bebe: "Premiers mois",
  fille: "Fille",
  garcon: "Garçon",
  pyjamas: "Nuit",
  accessoires: "Extras",
};

export function buildEditorialBlocksFromCategories(
  categories: Category[],
): EditorialBlock[] {
  return categories.slice(0, 3).map((category) => {
    const imageUrl = isRealEditorialImage(category.imageUrl) ? category.imageUrl : null;

    return {
      title: category.name,
      hook:
        category.description?.trim() ||
        FALLBACK_HOOKS[category.slug] ||
        "Une sélection pensée pour le quotidien des familles.",
      imageUrl,
      surfaceLabel: CATEGORY_SURFACE_LABELS[category.slug] ?? category.name,
      href: `/categorie/${category.slug}`,
      active: true,
    };
  });
}

export function resolveEditorialBlocks(
  configured: EditorialBlock[],
  categories: Category[],
): EditorialBlock[] {
  const activeConfigured = configured
    .filter((block) => block.active !== false)
    .map((block) => ({
      ...block,
      imageUrl: isRealEditorialImage(block.imageUrl) ? block.imageUrl : null,
    }));

  if (activeConfigured.length >= 2) {
    return activeConfigured.slice(0, 3);
  }

  return buildEditorialBlocksFromCategories(categories);
}
