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
  getGenderLabel,
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
import type { CatalogueFacets, Category } from "@/types/catalog";

interface CatalogueFiltersProps {
  categories: Category[];
  facets: CatalogueFacets;
  embedded?: boolean;
  className?: string;
  lockedCategorySlug?: string;
  basePath?: string;
}

function CatalogueAgeBandFilters({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (band: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide uppercase">
        Âge de l&apos;enfant
      </p>
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
              <span className="text-muted-foreground ml-1 hidden font-normal sm:inline">
                ({band.hint})
              </span>
            </Button>
          );
        })}
      </div>
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
  const genderSelectValue = isCatalogueFilterAll(gender)
    ? CATALOGUE_FILTER_ALL
    : (gender ?? CATALOGUE_FILTER_ALL);
  const genderDisplayLabel = getGenderLabel(gender);

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
          Effacer les filtres
        </Button>
      </div>

      <CatalogueAgeBandFilters
        selected={searchParams.get(CATALOGUE_PARAM_KEYS.ageBand)}
        onSelect={(band) =>
          updateSingle({
            [CATALOGUE_PARAM_KEYS.ageBand]: band,
          })
        }
      />

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

      <div className="space-y-2">
        <label id="catalogue-filter-gender" className="text-xs font-medium">
          Genre
        </label>
        <Select
          value={genderSelectValue}
          onValueChange={(value) =>
            updateSingle({
              [CATALOGUE_PARAM_KEYS.gender]: isCatalogueFilterAll(value) ? null : value,
            })
          }
        >
          <SelectTrigger className="w-full" aria-labelledby="catalogue-filter-gender">
            <SelectValue placeholder="Tous les genres">
              {genderDisplayLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CATALOGUE_FILTER_ALL}>Tous les genres</SelectItem>
            <SelectItem value="fille">Fille</SelectItem>
            <SelectItem value="garcon">Garçon</SelectItem>
            <SelectItem value="mixte">Mixte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="prix-min" className="text-xs font-medium">
            Prix min (€)
          </label>
          <Input
            id="prix-min"
            type="number"
            min={0}
            step={1}
            defaultValue={searchParams.get(CATALOGUE_PARAM_KEYS.minPrice) ?? ""}
            onBlur={(event) =>
              updateSingle({
                [CATALOGUE_PARAM_KEYS.minPrice]: event.target.value || null,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="prix-max" className="text-xs font-medium">
            Prix max (€)
          </label>
          <Input
            id="prix-max"
            type="number"
            min={0}
            step={1}
            defaultValue={searchParams.get(CATALOGUE_PARAM_KEYS.maxPrice) ?? ""}
            onBlur={(event) =>
              updateSingle({
                [CATALOGUE_PARAM_KEYS.maxPrice]: event.target.value || null,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        {shouldDisplayFacetGroup(facets.sizes) ? (
          <CatalogueFacetSection
            title="Tailles"
            paramKey={CATALOGUE_PARAM_KEYS.sizes}
            values={facets.sizes}
            selectedValues={selectedSizes}
            onToggle={(value) => toggleFacetValue(CATALOGUE_PARAM_KEYS.sizes, value)}
          />
        ) : null}
        {shouldDisplayFacetGroup(facets.colors) ? (
          <CatalogueFacetSection
            title="Couleurs"
            paramKey={CATALOGUE_PARAM_KEYS.colors}
            values={facets.colors}
            selectedValues={selectedColors}
            onToggle={(value) => toggleFacetValue(CATALOGUE_PARAM_KEYS.colors, value)}
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
