import { HOME_RAYONS } from "@/lib/catalog/home-sections";
import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";
import { getCatalogueCapsuleRituals } from "@/lib/rituals/catalogue-capsules";
import { getRitualCapsuleHref } from "@/lib/rituals/ritual-capsule";
import type { Category } from "@/types/catalog";

export interface CatalogueEmptySuggestion {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export interface CatalogueEmptyCopy {
  title: string;
  body: string;
}

function categorySlugFromHref(href: string): string | null {
  const path = href.split("?")[0] ?? href;
  const match = path.match(/^\/categorie\/([^/]+)$/);
  return match?.[1] ?? null;
}

/** Tailles les plus recherchées — raccourcis filtres catalogue. */
export const POPULAR_CATALOGUE_SIZES = ["12 mois", "2 ans", "4 ans", "6 ans"] as const;

function relatedRayonSuggestions(
  currentCategorySlug?: string,
): CatalogueEmptySuggestion[] {
  return HOME_RAYONS.filter(
    (rayon) => rayon.id !== "petits-prix" && rayon.id !== currentCategorySlug,
  )
    .slice(0, 4)
    .map((rayon) => ({
      id: `rayon-${rayon.id}`,
      label: rayon.label,
      href: rayon.href,
      description: rayon.description,
    }));
}

function relatedCategorySuggestions(
  currentCategorySlug: string | undefined,
  categories: Category[],
): CatalogueEmptySuggestion[] {
  if (categories.length === 0) return relatedRayonSuggestions(currentCategorySlug);

  return categories
    .filter((category) => category.slug !== currentCategorySlug)
    .slice(0, 4)
    .map((category) => ({
      id: `cat-${category.slug}`,
      label: category.name,
      href: `/categorie/${category.slug}`,
    }));
}

/** Capsules shopping réelles — jamais de lien blog. */
export function getNearbyCapsuleSuggestions(
  categorySlug?: string,
): CatalogueEmptySuggestion[] {
  return getCatalogueCapsuleRituals(categorySlug)
    .slice(0, 4)
    .map((ritual) => ({
      id: `capsule-${ritual.slug}`,
      label: ritual.title,
      href: getRitualCapsuleHref(ritual.slug),
      description: ritual.promise,
    }));
}

export function getAvailableSizesHref(categorySlug?: string): string {
  return categorySlug ? buildCategoryHref(categorySlug) : buildCatalogueHref();
}

export function getAvailableSizesSuggestion(
  categorySlug?: string,
): CatalogueEmptySuggestion {
  return {
    id: "available-sizes",
    label: "Voir les tailles disponibles",
    href: getAvailableSizesHref(categorySlug),
    description: "Toutes les tailles encore en stock dans le rayon",
  };
}

export function buildCatalogueEmptyCopy(options: {
  hasActiveFilters: boolean;
  categoryName?: string;
}): CatalogueEmptyCopy {
  const { hasActiveFilters, categoryName } = options;

  if (!hasActiveFilters) {
    return {
      title: categoryName ? `${categoryName} arrive mercredi` : "Ce rayon arrive mercredi",
      body: "Nouvelles pièces chaque semaine. En attendant, parcourez les capsules et rayons déjà en ligne.",
    };
  }

  return {
    title: "Aucune pièce pour cette sélection",
    body: "Élargissez la taille ou revenez aux pièces encore disponibles dans le rayon.",
  };
}

export function getCatalogueEmptySuggestions(options?: {
  categorySlug?: string;
  categories?: Category[];
  hasActiveFilters?: boolean;
}): CatalogueEmptySuggestion[] {
  const { categorySlug, categories = [], hasActiveFilters = false } = options ?? {};
  const basePath = categorySlug ? `/categorie/${categorySlug}` : "/catalogue";

  const suggestions: CatalogueEmptySuggestion[] = [];

  if (hasActiveFilters) {
    suggestions.push({
      id: "reset",
      label: "Effacer les filtres",
      href: basePath,
      description: "Revenir à tout le rayon",
    });
    suggestions.push(getAvailableSizesSuggestion(categorySlug));
  }

  suggestions.push(
    {
      id: "nouveautes",
      label: "Nouveautés",
      href: categorySlug
        ? buildCategoryHref(categorySlug, { sort: "newest" })
        : buildCatalogueHref({ sort: "newest" }),
      description: "Derniers arrivages du mercredi",
    },
    {
      id: "petits-prix",
      label: "Petits prix",
      href: categorySlug
        ? buildCategoryHref(categorySlug, { promo: "petit-prix" })
        : buildCatalogueHref({ promo: "petit-prix" }),
      description: "Essentiels à petit budget",
    },
  );

  const rayons = categorySlug
    ? relatedCategorySuggestions(categorySlug, categories)
    : relatedRayonSuggestions(categorySlug);

  for (const rayon of rayons) {
    if (!suggestions.some((item) => item.id === rayon.id)) {
      suggestions.push(rayon);
    }
  }

  if (categories.length > 0 && !categorySlug) {
    for (const category of categories.slice(0, 3)) {
      const alreadyListed = suggestions.some(
        (item) => categorySlugFromHref(item.href) === category.slug,
      );
      if (!alreadyListed) {
        suggestions.push({
          id: `cat-${category.slug}`,
          label: category.name,
          href: `/categorie/${category.slug}`,
        });
      }
    }
  }

  return suggestions.slice(0, 8);
}

export function getPopularSizeSuggestions(
  categorySlug?: string,
): CatalogueEmptySuggestion[] {
  return POPULAR_CATALOGUE_SIZES.map((size) => ({
    id: `size-${size}`,
    label: size,
    href: categorySlug
      ? buildCategoryHref(categorySlug, { sizes: [size] })
      : buildCatalogueHref({ sizes: [size] }),
  }));
}
