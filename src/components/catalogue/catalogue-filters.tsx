"use client";

import { useCatalogueNavigation } from "@/hooks/use-catalogue-navigation";
import {
  CATALOGUE_PARAM_KEYS,
  readMultiParamFromSearchParams,
} from "@/lib/catalog/catalogue-search-params";
import { CATALOGUE_AGE_BANDS } from "@/lib/catalog/catalogue-age-bands";
import { shouldDisplayFacetGroup } from "@/lib/catalog/catalogue-facets";
import {
  CATALOGUE_FILTER_ALL,
  getCategoryFilterLabel,
  isCatalogueFilterAll,
} from "@/lib/catalog/catalogue-labels";
import { CatalogueFacetSection } from "@/components/catalogue/catalogue-facet-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CatalogueFacets, CatalogueFacetValue, Category } from "@/types/catalog";

interface CatalogueFiltersProps {
  categories: Category[];
  facets: CatalogueFacets;
  embedded?: boolean;
  className?: string;
  lockedCategorySlug?: string;
  basePath?: string;
}

const GENDER_OPTIONS = [
  { value: null, label: "Tous" },
  { value: "fille", label: "Fille" },
  { value: "garcon", label: "Garçon" },
  { value: "mixte", label: "Mixte" },
] as const;

function FilterChipGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-tilouki-navy text-xs font-semibold tracking-wide uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function CatalogueAgeBandFilters({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (band: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATALOGUE_AGE_BANDS.map((band) => {
        const active = selected === band.value;
        return (
          <Button
            key={band.value}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-semibold",
              active && "bg-tilouki-teal-dark hover:bg-tilouki-teal-dark/90",
            )}
            aria-pressed={active}
            onClick={() => onSelect(active ? null : band.value)}
          >
            {band.label}
          </Button>
        );
      })}
    </div>
  );
}

function CatalogueGenderFilters({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (gender: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENDER_OPTIONS.map((option) => {
        const active = (selected ?? null) === option.value;
        return (
          <Button
            key={option.label}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-semibold",
              active && "bg-tilouki-teal-dark hover:bg-tilouki-teal-dark/90",
            )}
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

function CatalogueSizeChips({
  values,
  selectedValues,
  onToggle,
}: {
  values: CatalogueFacetValue[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((facet) => {
        const active = selectedValues.includes(facet.value);
        return (
          <Button
            key={facet.value}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className={cn(
              "h-9 min-w-9 rounded-full px-3 text-xs font-semibold tabular-nums",
              active && "bg-tilouki-teal-dark hover:bg-tilouki-teal-dark/90",
            )}
            aria-pressed={active}
            onClick={() => onToggle(facet.value)}
          >
            {facet.value}
            <span className="sr-only"> — {facet.count} article(s)</span>
          </Button>
        );
      })}
    </div>
  );
}

export function CatalogueFilters({
  categories,
  facets,
  embedded = false,
  className,
  lockedCategorySlug,
  basePath: basePathProp,
}: CatalogueFiltersProps) {
  const basePath =
    basePathProp ??
    (lockedCategorySlug ? `/categorie/${lockedCategorySlug}` : "/catalogue");
  const { searchParams, updateSingle, toggleFacetValue, reset } =
    useCatalogueNavigation(basePath, lockedCategorySlug);

  const selectedSizes = readMultiParamFromSearchParams(
    searchParams,
    CATALOGUE_PARAM_KEYS.sizes,
  );
  const selectedColors = readMultiParamFromSearchParams(
    searchParams,
    CATALOGUE_PARAM_KEYS.colors,
  );
  const selectedAges = readMultiParamFromSearchParams(
    searchParams,
    CATALOGUE_PARAM_KEYS.ages,
  );

  const categorySlug = searchParams.get(CATALOGUE_PARAM_KEYS.category);
  const categorySelectValue = isCatalogueFilterAll(categorySlug)
    ? CATALOGUE_FILTER_ALL
    : (categorySlug ?? CATALOGUE_FILTER_ALL);
  const categoryDisplayLabel = getCategoryFilterLabel(categorySlug, categories);

  const gender = searchParams.get(CATALOGUE_PARAM_KEYS.gender);

  const Wrapper = embedded ? "div" : "aside";

  return (
    <Wrapper
      className={
        embedded
          ? `space-y-4 ${className ?? ""}`
          : `bg-card space-y-4 rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft)] lg:p-5 ${className ?? ""}`
      }
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Affiner la sélection</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-tilouki-teal-dark h-8 px-2 text-xs font-semibold"
        >
          Effacer
        </Button>
      </div>

      <div className="border-tilouki-jade/20 bg-tilouki-cloud/60 space-y-4 rounded-xl border p-3.5">
        <FilterChipGroup title="Âge">
          <CatalogueAgeBandFilters
            selected={searchParams.get(CATALOGUE_PARAM_KEYS.ageBand)}
            onSelect={(band) =>
              updateSingle({
                [CATALOGUE_PARAM_KEYS.ageBand]: band,
              })
            }
          />
        </FilterChipGroup>

        <FilterChipGroup title="Genre">
          <CatalogueGenderFilters
            selected={gender}
            onSelect={(value) =>
              updateSingle({
                [CATALOGUE_PARAM_KEYS.gender]: value,
              })
            }
          />
        </FilterChipGroup>

        <FilterChipGroup title="Prix (€)">
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="prix-min"
              type="number"
              min={0}
              step={1}
              aria-label="Prix minimum en euros"
              placeholder="Min"
              className="bg-background h-9"
              defaultValue={searchParams.get(CATALOGUE_PARAM_KEYS.minPrice) ?? ""}
              onBlur={(event) =>
                updateSingle({
                  [CATALOGUE_PARAM_KEYS.minPrice]: event.target.value || null,
                })
              }
            />
            <Input
              id="prix-max"
              type="number"
              min={0}
              step={1}
              aria-label="Prix maximum en euros"
              placeholder="Max"
              className="bg-background h-9"
              defaultValue={searchParams.get(CATALOGUE_PARAM_KEYS.maxPrice) ?? ""}
              onBlur={(event) =>
                updateSingle({
                  [CATALOGUE_PARAM_KEYS.maxPrice]: event.target.value || null,
                })
              }
            />
          </div>
        </FilterChipGroup>

        {shouldDisplayFacetGroup(facets.sizes) ? (
          <FilterChipGroup title="Taille">
            <CatalogueSizeChips
              values={facets.sizes}
              selectedValues={selectedSizes}
              onToggle={(value) => toggleFacetValue(CATALOGUE_PARAM_KEYS.sizes, value)}
            />
          </FilterChipGroup>
        ) : null}
      </div>

      <details className="group border-border/70 border-b pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span>Recherche et catégorie</span>
          <span className="text-muted-foreground text-xs font-medium group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="mt-2 space-y-3">
          <div className="space-y-2">
            <label htmlFor="filter-q" className="text-xs font-medium">
              Recherche
            </label>
            <Input
              id="filter-q"
              defaultValue={searchParams.get(CATALOGUE_PARAM_KEYS.query) ?? ""}
              placeholder="Nom, matière…"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateSingle({
                    [CATALOGUE_PARAM_KEYS.query]: event.currentTarget.value || null,
                  });
                }
              }}
            />
          </div>

          {!lockedCategorySlug ? (
            <div className="space-y-2">
              <label id="catalogue-filter-category" className="text-xs font-medium">
                Catégorie
              </label>
              <Select
                value={categorySelectValue}
                onValueChange={(value) =>
                  updateSingle({
                    [CATALOGUE_PARAM_KEYS.category]: isCatalogueFilterAll(value)
                      ? null
                      : value,
                  })
                }
              >
                <SelectTrigger
                  className="w-full"
                  aria-labelledby="catalogue-filter-category"
                >
                  <SelectValue placeholder="Toutes les catégories">
                    {categoryDisplayLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CATALOGUE_FILTER_ALL}>
                    Toutes les catégories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </details>

      <div className="space-y-1">
        {shouldDisplayFacetGroup(facets.colors) ? (
          <CatalogueFacetSection
            title="Couleurs"
            paramKey={CATALOGUE_PARAM_KEYS.colors}
            values={facets.colors}
            selectedValues={selectedColors}
            onToggle={(value) => toggleFacetValue(CATALOGUE_PARAM_KEYS.colors, value)}
            defaultOpen={false}
          />
        ) : null}
        {shouldDisplayFacetGroup(facets.ages) ? (
          <CatalogueFacetSection
            title="Âges détaillés"
            paramKey={CATALOGUE_PARAM_KEYS.ages}
            values={facets.ages}
            selectedValues={selectedAges}
            onToggle={(value) => toggleFacetValue(CATALOGUE_PARAM_KEYS.ages, value)}
            defaultOpen={false}
          />
        ) : null}
      </div>
    </Wrapper>
  );
}
