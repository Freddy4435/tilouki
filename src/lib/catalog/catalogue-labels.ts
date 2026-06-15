import type { ProductSort } from "@/types/catalog";

import { getAgeBandLabel } from "@/lib/catalog/catalogue-age-bands";
import { PRODUCT_SORT_OPTIONS } from "./constants";

/** Valeur interne des selects « aucun filtre » — jamais affichée telle quelle. */
export const CATALOGUE_FILTER_ALL = "__all__" as const;

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Nouveautés",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  name_asc: "Nom A → Z",
};

const GENDER_LABELS: Record<string, string> = {
  fille: "Fille",
  garcon: "Garçon",
  mixte: "Mixte",
};

const INTERNAL_VALUE_PATTERN =
  /^(newest|price_asc|price_desc|name_asc|__all__|all|petit-prix)$/i;

export function isCatalogueFilterAll(value: string | null | undefined): boolean {
  return !value || value === CATALOGUE_FILTER_ALL || value === "all";
}

export function sanitizeCatalogueDisplayValue(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value?.trim() || INTERNAL_VALUE_PATTERN.test(value.trim())) {
    return fallback;
  }
  return value.trim();
}

export function getSortLabel(sort: string | null | undefined): string {
  if (!sort || sort === "newest") return SORT_LABELS.newest;
  if (sort in SORT_LABELS) return SORT_LABELS[sort as ProductSort];
  const option = PRODUCT_SORT_OPTIONS.find((item) => item.value === sort);
  return option?.label ?? SORT_LABELS.newest;
}

export function getGenderLabel(gender: string | null | undefined): string {
  if (!gender) return "Tous les genres";
  return GENDER_LABELS[gender] ?? "Genre";
}

export function getCategoryFilterLabel(
  slug: string | null | undefined,
  categories: { slug: string; name: string }[],
): string {
  if (!slug) return "Toutes les catégories";
  return categories.find((category) => category.slug === slug)?.name ?? "Catégorie";
}

export function isDefaultSort(sort: string | null | undefined): boolean {
  return !sort || sort === "newest";
}

export function formatArticleCount(count: number): string {
  if (count <= 0) return "Aucun article";
  if (count === 1) return "1 article";
  return `${count} articles`;
}

export function formatPagePosition(page: number, totalPages: number): string | null {
  if (totalPages <= 1) return null;
  return `page ${page} sur ${totalPages}`;
}

export function formatCatalogueResultsSummary(
  total: number,
  page: number,
  totalPages: number,
): string {
  const articles = formatArticleCount(total);
  const pageLabel = formatPagePosition(page, totalPages);
  return pageLabel ? `${articles} · ${pageLabel}` : articles;
}

export function formatActiveSearchLabel(query: string): string {
  return `Recherche : « ${query.trim()} »`;
}

export function formatActiveCategoryLabel(name: string): string {
  return `Catégorie : ${name}`;
}

export function formatActiveGenderLabel(gender: string): string {
  return `Genre : ${getGenderLabel(gender)}`;
}

export function formatActiveSortLabel(sort: string): string {
  return `Tri : ${getSortLabel(sort)}`;
}

export function formatActivePriceMinLabel(value: string): string {
  return `Prix min. : ${value} €`;
}

export function formatActivePriceMaxLabel(value: string): string {
  return `Prix max. : ${value} €`;
}

export function formatActiveSizeLabel(size: string): string {
  return `Taille : ${size}`;
}

export function formatActiveAgeLabel(age: string): string {
  return `Âge : ${age}`;
}

export function formatActiveAgeBandLabel(band: string): string {
  return `Tranche : ${getAgeBandLabel(band)}`;
}

export function formatActiveColorLabel(color: string): string {
  return `Couleur : ${color}`;
}

export function formatActiveSeasonLabel(season: string): string {
  return `Saison : ${season}`;
}

export function formatCategoryCountLabel(count: number): string {
  if (count <= 0) return "Catalogue en cours d'approvisionnement";
  if (count === 1) return "1 catégorie disponible";
  return `${count} catégories disponibles`;
}
