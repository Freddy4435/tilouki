import type { Category } from "@/types/catalog";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  fille: "Vêtements fille pour le quotidien : pièces douces, faciles à enfiler et à assortir.",
  garcon: "Vêtements garçon pratiques et confortables, du tee-shirt au sweat.",
  bebe: "Vêtements bébé pensés pour le confort et les premières sorties.",
  pyjamas: "Pyjamas et tenues de nuit douillettes pour bien dormir.",
  accessoires: "Accessoires enfants pour compléter la garde-robe.",
};

export function getCategorySeoDescription(category: Category): string {
  if (category.description?.trim()) return category.description.trim();
  return (
    CATEGORY_DESCRIPTIONS[category.slug] ??
    `Découvrez notre sélection ${category.name.toLowerCase()} — vêtements enfants sur Tilouki.`
  );
}

export const CATALOGUE_SEO_DESCRIPTION =
  "Parcourez notre catalogue de vêtements enfants : fille, garçon, tee-shirts, sweats et plus. Livraison en point relais en France.";

export const LIVRAISON_SEO_DESCRIPTION =
  "Livraison en point relais Mondial Relay, délais, retours et droit de rétractation — toutes les informations pratiques.";
