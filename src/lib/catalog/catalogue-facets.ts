import { variantMatchesAgeBand } from "@/lib/catalog/catalogue-age-bands";
import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import type { ProductWithRelations } from "@/lib/supabase/mappers/product";
import type {
  CatalogueFacetValue,
  CatalogueFacets,
  CatalogueQuery,
  ProductListItem,
} from "@/types/catalog";

export type CatalogueFacetKey = "sizes" | "ages" | "colors";

export interface CataloguePreparedRow {
  row: ProductWithRelations;
  item: ProductListItem;
}

type VariantField = "size_label" | "age_label" | "color";

const FACET_CONFIG: Record<
  CatalogueFacetKey,
  {
    queryKey: keyof Pick<CatalogueQuery, "sizes" | "ages" | "colors">;
    field: VariantField;
  }
> = {
  sizes: { queryKey: "sizes", field: "size_label" },
  ages: { queryKey: "ages", field: "age_label" },
  colors: { queryKey: "colors", field: "color" },
};

function getActiveVariants(row: ProductWithRelations) {
  return row.variants.filter(
    (variant) => variant.is_active && variant.stock_quantity > 0,
  );
}

function matchesVariantFilters(
  row: ProductWithRelations,
  query: CatalogueQuery,
  excludeFacet?: CatalogueFacetKey,
): boolean {
  const sizes = excludeFacet === "sizes" ? [] : (query.sizes ?? []);
  const ages = excludeFacet === "ages" ? [] : (query.ages ?? []);
  const ageBand = excludeFacet === "ages" ? undefined : query.ageBand;
  const colors = excludeFacet === "colors" ? [] : (query.colors ?? []);

  if (sizes.length === 0 && ages.length === 0 && !ageBand && colors.length === 0) {
    return true;
  }

  return getActiveVariants(row).some((variant) => {
    const sizeOk =
      sizes.length === 0 ||
      (variant.size_label != null && sizes.includes(variant.size_label));
    const ageOk =
      ages.length === 0 && !ageBand
        ? true
        : ages.length > 0
          ? variant.age_label != null && ages.includes(variant.age_label)
          : ageBand
            ? variantMatchesAgeBand(variant.age_label, variant.size_label, ageBand)
            : false;
    const colorOk =
      colors.length === 0 || (variant.color != null && colors.includes(variant.color));
    return sizeOk && ageOk && colorOk;
  });
}

export function matchesCatalogueProductFilters(
  item: ProductListItem,
  query: CatalogueQuery,
): boolean {
  if (query.categorySlug && item.categorySlug !== query.categorySlug) return false;
  if (query.minPriceCents != null && item.minPriceCents < query.minPriceCents)
    return false;
  if (query.maxPriceCents != null && item.minPriceCents > query.maxPriceCents)
    return false;
  if (query.promo === "petit-prix" && !filterLowPriceProducts([item]).length)
    return false;
  return true;
}

export function matchesCataloguePreparedRow(
  prepared: CataloguePreparedRow,
  query: CatalogueQuery,
  excludeFacet?: CatalogueFacetKey,
): boolean {
  if (!matchesCatalogueProductFilters(prepared.item, query)) return false;
  return matchesVariantFilters(prepared.row, query, excludeFacet);
}

function sortFacetValues(values: CatalogueFacetValue[]): CatalogueFacetValue[] {
  return [...values].sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return left.value.localeCompare(right.value, "fr");
  });
}

function countFacetValues(
  preparedRows: CataloguePreparedRow[],
  field: VariantField,
): CatalogueFacetValue[] {
  const counts = new Map<string, number>();

  for (const prepared of preparedRows) {
    const seen = new Set<string>();
    for (const variant of getActiveVariants(prepared.row)) {
      const value = variant[field]?.trim();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return sortFacetValues(
    [...counts.entries()].map(([value, count]) => ({
      value,
      count,
    })),
  );
}

export function shouldDisplayFacetGroup(values: CatalogueFacetValue[]): boolean {
  return values.filter((value) => value.count > 0).length >= 2;
}

export function computeCatalogueFacets(
  preparedRows: CataloguePreparedRow[],
  query: CatalogueQuery,
): CatalogueFacets {
  const sizes = countFacetValues(
    preparedRows.filter((prepared) =>
      matchesCataloguePreparedRow(prepared, query, "sizes"),
    ),
    "size_label",
  );
  const ages = countFacetValues(
    preparedRows.filter((prepared) =>
      matchesCataloguePreparedRow(prepared, query, "ages"),
    ),
    "age_label",
  );
  const colors = countFacetValues(
    preparedRows.filter((prepared) =>
      matchesCataloguePreparedRow(prepared, query, "colors"),
    ),
    "color",
  );

  return { sizes, ages, colors };
}

export function filterCataloguePreparedRows(
  preparedRows: CataloguePreparedRow[],
  query: CatalogueQuery,
): CataloguePreparedRow[] {
  return preparedRows.filter((prepared) =>
    matchesCataloguePreparedRow(prepared, query),
  );
}

export function buildCataloguePreparedRows(
  rows: ProductWithRelations[],
  mapProductListItem: (row: ProductWithRelations) => ProductListItem,
): CataloguePreparedRow[] {
  return rows.map((row) => ({
    row,
    item: mapProductListItem(row),
  }));
}

export function getFacetQueryKey(facet: CatalogueFacetKey): keyof CatalogueQuery {
  return FACET_CONFIG[facet].queryKey;
}
