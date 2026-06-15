export const CATALOGUE_PARAM_KEYS = {
  query: "q",
  category: "categorie",
  gender: "genre",
  season: "saison",
  sort: "tri",
  page: "page",
  minPrice: "prix_min",
  maxPrice: "prix_max",
  promo: "promo",
  sizes: "tailles",
  colors: "couleurs",
  ages: "ages",
  ageBand: "tranche_age",
} as const;

export const CATALOGUE_URL_FILTER_KEYS = [
  CATALOGUE_PARAM_KEYS.query,
  CATALOGUE_PARAM_KEYS.category,
  CATALOGUE_PARAM_KEYS.gender,
  CATALOGUE_PARAM_KEYS.season,
  CATALOGUE_PARAM_KEYS.sort,
  CATALOGUE_PARAM_KEYS.minPrice,
  CATALOGUE_PARAM_KEYS.maxPrice,
  CATALOGUE_PARAM_KEYS.promo,
  CATALOGUE_PARAM_KEYS.sizes,
  CATALOGUE_PARAM_KEYS.colors,
  CATALOGUE_PARAM_KEYS.ages,
  CATALOGUE_PARAM_KEYS.ageBand,
] as const;

export const MAX_CATALOGUE_MULTI_VALUES = 24;
export const MAX_CATALOGUE_FACET_VALUE_LENGTH = 80;

export function parseMultiParamValue(raw: string | string[] | undefined): string[] {
  if (!raw) return [];

  const parts = (Array.isArray(raw) ? raw : [raw])
    .flatMap((part) => part.split(","))
    .map((part) => part.trim())
    .filter(
      (part) => part.length > 0 && part.length <= MAX_CATALOGUE_FACET_VALUE_LENGTH,
    );

  return [...new Set(parts)].slice(0, MAX_CATALOGUE_MULTI_VALUES);
}

export function serializeMultiParamValue(values: string[] | undefined): string | null {
  if (!values?.length) return null;
  return values.join(",");
}

export function toggleMultiParamValue(current: string[], value: string): string[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export function readMultiParamFromSearchParams(
  params: URLSearchParams,
  key: string,
): string[] {
  const repeated = params.getAll(key);
  if (repeated.length > 1) {
    return parseMultiParamValue(repeated);
  }

  return parseMultiParamValue(params.get(key) ?? undefined);
}

export function setMultiParamOnSearchParams(
  params: URLSearchParams,
  key: string,
  values: string[],
): void {
  params.delete(key);
  const serialized = serializeMultiParamValue(values);
  if (serialized) params.set(key, serialized);
}

export function hasCatalogueFiltersInQuery(query: {
  query?: string;
  categorySlug?: string;
  gender?: string;
  season?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  promo?: string;
  sizes?: string[];
  colors?: string[];
  ages?: string[];
  ageBand?: string;
}): boolean {
  return Boolean(
    query.query?.trim() ||
    query.categorySlug ||
    query.gender ||
    query.season?.trim() ||
    query.minPriceCents != null ||
    query.maxPriceCents != null ||
    query.promo ||
    query.sizes?.length ||
    query.colors?.length ||
    query.ages?.length ||
    query.ageBand,
  );
}
