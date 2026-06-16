import { HOME_RAYONS } from "@/lib/catalog/home-sections";
import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";

import { CATALOGUE_PARAM_KEYS } from "./catalogue-search-params";
import { isDefaultSort } from "./catalogue-labels";

export type CatalogueQuickChipId =
  | "nouveautes"
  | "petits-prix"
  | "bebe"
  | "pyjamas"
  | "fille"
  | "garcon"
  | "rayon";

export interface CatalogueQuickChip {
  id: CatalogueQuickChipId | `rayon-${string}`;
  label: string;
  href: string;
}

export const CATALOGUE_QUICK_CHIPS: readonly CatalogueQuickChip[] = [
  {
    id: "nouveautes",
    label: "Nouveautés",
    href: buildCatalogueHref({ sort: "newest" }),
  },
  {
    id: "petits-prix",
    label: "Petits prix",
    href: buildCatalogueHref({ promo: "petit-prix" }),
  },
  { id: "bebe", label: "Bébé", href: buildCategoryHref("bebe") },
  { id: "pyjamas", label: "Pyjamas", href: buildCategoryHref("pyjamas") },
] as const;

/** Chips contextuels sur une page rayon. */
export function getContextualQuickChips(categorySlug?: string): CatalogueQuickChip[] {
  if (!categorySlug) return [...CATALOGUE_QUICK_CHIPS];

  const relatedRayons = HOME_RAYONS.filter(
    (rayon) => rayon.id !== "petits-prix" && rayon.id !== categorySlug,
  ).slice(0, 3);

  return [
    {
      id: "nouveautes",
      label: "Nouveautés",
      href: buildCategoryHref(categorySlug, { sort: "newest" }),
    },
    {
      id: "petits-prix",
      label: "Petits prix",
      href: buildCategoryHref(categorySlug, { promo: "petit-prix" }),
    },
    ...relatedRayons.map((rayon) => ({
      id: `rayon-${rayon.id}` as const,
      label: rayon.label,
      href: rayon.href,
    })),
  ];
}

export function isCatalogueQuickChipActive(
  chip: CatalogueQuickChip,
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  if (chip.id === "nouveautes") {
    const onCatalogue =
      pathname === "/catalogue" && !searchParams.get(CATALOGUE_PARAM_KEYS.category);
    const onCategory = pathname.startsWith("/categorie/");
    return (
      (onCatalogue || onCategory) &&
      !searchParams.get(CATALOGUE_PARAM_KEYS.promo) &&
      isDefaultSort(searchParams.get(CATALOGUE_PARAM_KEYS.sort))
    );
  }

  if (chip.id === "petits-prix") {
    return searchParams.get(CATALOGUE_PARAM_KEYS.promo) === "petit-prix";
  }

  if (chip.id.startsWith("rayon-")) {
    const slug = chip.id.replace("rayon-", "");
    return pathname === `/categorie/${slug}`;
  }

  switch (chip.id) {
    case "bebe":
      return pathname === "/categorie/bebe";
    case "pyjamas":
      return pathname === "/categorie/pyjamas";
    case "fille":
      return pathname === "/categorie/fille";
    case "garcon":
      return pathname === "/categorie/garcon";
    default:
      return false;
  }
}
