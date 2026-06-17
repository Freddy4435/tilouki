"use client";

import { X } from "lucide-react";

import { useCatalogueNavigation } from "@/hooks/use-catalogue-navigation";
import {
  CATALOGUE_PARAM_KEYS,
  readMultiParamFromSearchParams,
} from "@/lib/catalog/catalogue-search-params";
import {
  formatActiveAgeBandLabel,
  formatActiveAgeLabel,
  formatActiveCategoryLabel,
  formatActiveColorLabel,
  formatActiveGenderLabel,
  formatActivePriceMaxLabel,
  formatActivePriceMinLabel,
  formatActiveSearchLabel,
  formatActiveSeasonLabel,
  formatActiveSizeLabel,
  formatActiveSortLabel,
  getCategoryFilterLabel,
  isDefaultSort,
} from "@/lib/catalog/catalogue-labels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

interface ActiveFilterPill {
  key: string;
  value?: string;
  label: string;
}

interface CatalogueActiveFiltersProps {
  categories: Category[];
  basePath?: string;
  lockedCategorySlug?: string;
  className?: string;
  compact?: boolean;
}

export function CatalogueActiveFilters({
  categories,
  basePath = "/catalogue",
  lockedCategorySlug,
  className,
  compact = false,
}: CatalogueActiveFiltersProps) {
  const { searchParams, updateSingle, removeFacetValue, reset } =
    useCatalogueNavigation(basePath, lockedCategorySlug);

  const pills: ActiveFilterPill[] = [];

  const q = searchParams.get(CATALOGUE_PARAM_KEYS.query);
  if (q?.trim()) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.query,
      label: formatActiveSearchLabel(q),
    });
  }

  const categorySlug = searchParams.get(CATALOGUE_PARAM_KEYS.category);
  if (categorySlug) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.category,
      label: formatActiveCategoryLabel(
        getCategoryFilterLabel(categorySlug, categories),
      ),
    });
  }

  const genre = searchParams.get(CATALOGUE_PARAM_KEYS.gender);
  if (genre) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.gender,
      label: formatActiveGenderLabel(genre),
    });
  }

  const ageBand = searchParams.get(CATALOGUE_PARAM_KEYS.ageBand);
  if (ageBand) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.ageBand,
      label: formatActiveAgeBandLabel(ageBand),
    });
  }

  const season = searchParams.get(CATALOGUE_PARAM_KEYS.season);
  if (season) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.season,
      label: formatActiveSeasonLabel(season),
    });
  }

  const minPrice = searchParams.get(CATALOGUE_PARAM_KEYS.minPrice);
  if (minPrice) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.minPrice,
      label: formatActivePriceMinLabel(minPrice),
    });
  }

  const maxPrice = searchParams.get(CATALOGUE_PARAM_KEYS.maxPrice);
  if (maxPrice) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.maxPrice,
      label: formatActivePriceMaxLabel(maxPrice),
    });
  }

  if (searchParams.get(CATALOGUE_PARAM_KEYS.promo) === "petit-prix") {
    pills.push({ key: CATALOGUE_PARAM_KEYS.promo, label: "Petits prix" });
  }

  for (const size of readMultiParamFromSearchParams(
    searchParams,
    CATALOGUE_PARAM_KEYS.sizes,
  )) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.sizes,
      value: size,
      label: formatActiveSizeLabel(size),
    });
  }

  for (const color of readMultiParamFromSearchParams(
    searchParams,
    CATALOGUE_PARAM_KEYS.colors,
  )) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.colors,
      value: color,
      label: formatActiveColorLabel(color),
    });
  }

  for (const age of readMultiParamFromSearchParams(
    searchParams,
    CATALOGUE_PARAM_KEYS.ages,
  )) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.ages,
      value: age,
      label: formatActiveAgeLabel(age),
    });
  }

  const sort = searchParams.get(CATALOGUE_PARAM_KEYS.sort);
  if (!isDefaultSort(sort)) {
    pills.push({
      key: CATALOGUE_PARAM_KEYS.sort,
      label: formatActiveSortLabel(sort ?? "newest"),
    });
  }

  if (pills.length === 0) return null;

  const removeFilter = (pill: ActiveFilterPill) => {
    if (pill.value) {
      removeFacetValue(pill.key, pill.value);
      return;
    }
    updateSingle({ [pill.key]: null });
  };

  return (
    <ul
      className={cn(
        "mb-4 flex list-none flex-wrap items-center gap-2 p-0",
        compact &&
          "max-w-full [scrollbar-width:none] flex-nowrap overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label="Filtres actifs"
    >
      {pills.map((pill) => (
        <li key={`${pill.key}-${pill.value ?? pill.label}`}>
          <button
            type="button"
            onClick={() => removeFilter(pill)}
            className="bg-tilouki-jade-soft/70 text-tilouki-teal-dark hover:bg-tilouki-jade-soft inline-flex max-w-full shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--transition-fast)]"
          >
            <span className="truncate">{pill.label}</span>
            <X className="size-3 shrink-0" aria-hidden />
            <span className="sr-only">Retirer le filtre {pill.label}</span>
          </button>
        </li>
      ))}
      {!compact ? (
        <li>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={reset}
            className="h-8 rounded-full px-3 text-xs font-semibold"
          >
            Effacer les filtres
          </Button>
        </li>
      ) : null}
    </ul>
  );
}
