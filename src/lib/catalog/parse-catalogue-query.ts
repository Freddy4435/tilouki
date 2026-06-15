import { z } from "zod";

import {
  CATALOGUE_PARAM_KEYS,
  parseMultiParamValue,
} from "@/lib/catalog/catalogue-search-params";
import { isCatalogueAgeBand } from "@/lib/catalog/catalogue-age-bands";
import type { CatalogueQuery } from "@/types/catalog";
import type { ProductGender } from "@/types/database";

const GENDERS = [
  "fille",
  "garcon",
  "mixte",
] as const satisfies readonly ProductGender[];

const SORT_VALUES = ["newest", "price_asc", "price_desc", "name_asc"] as const;

const priceEuroSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (!value?.trim()) return undefined;
    const normalized = Number(value.replace(",", ".").trim());
    if (!Number.isFinite(normalized) || normalized < 0 || normalized > 10_000) {
      return undefined;
    }
    return Math.round(normalized * 100);
  });

const shortTextSchema = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    return trimmed.slice(0, 120);
  });

const multiValueSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => parseMultiParamValue(value));

export const catalogueQuerySchema = z
  .object({
    [CATALOGUE_PARAM_KEYS.query]: shortTextSchema,
    [CATALOGUE_PARAM_KEYS.category]: shortTextSchema,
    [CATALOGUE_PARAM_KEYS.gender]: z
      .string()
      .optional()
      .transform((value) => {
        const normalized = value?.trim();
        return GENDERS.find((gender) => gender === normalized);
      }),
    [CATALOGUE_PARAM_KEYS.season]: shortTextSchema,
    [CATALOGUE_PARAM_KEYS.sort]: z
      .string()
      .optional()
      .transform((value) => {
        const normalized = value?.trim();
        return SORT_VALUES.find((sort) => sort === normalized) ?? "newest";
      }),
    [CATALOGUE_PARAM_KEYS.page]: z
      .string()
      .optional()
      .transform((value) => {
        const page = Number(value?.trim() ?? "1");
        if (!Number.isFinite(page) || page < 1 || page > 500) return 1;
        return Math.floor(page);
      }),
    [CATALOGUE_PARAM_KEYS.minPrice]: priceEuroSchema,
    [CATALOGUE_PARAM_KEYS.maxPrice]: priceEuroSchema,
    [CATALOGUE_PARAM_KEYS.promo]: z
      .string()
      .optional()
      .transform((value): CatalogueQuery["promo"] =>
        value?.trim() === "petit-prix" ? "petit-prix" : undefined,
      ),
    [CATALOGUE_PARAM_KEYS.sizes]: multiValueSchema,
    [CATALOGUE_PARAM_KEYS.colors]: multiValueSchema,
    [CATALOGUE_PARAM_KEYS.ages]: multiValueSchema,
    [CATALOGUE_PARAM_KEYS.ageBand]: z
      .string()
      .optional()
      .transform((value) => {
        const normalized = value?.trim();
        return isCatalogueAgeBand(normalized) ? normalized : undefined;
      }),
  })
  .transform((value) => ({
    categorySlug: value[CATALOGUE_PARAM_KEYS.category],
    query: value[CATALOGUE_PARAM_KEYS.query],
    gender: value[CATALOGUE_PARAM_KEYS.gender],
    season: value[CATALOGUE_PARAM_KEYS.season],
    sort: value[CATALOGUE_PARAM_KEYS.sort],
    page: value[CATALOGUE_PARAM_KEYS.page],
    minPriceCents: value[CATALOGUE_PARAM_KEYS.minPrice],
    maxPriceCents: value[CATALOGUE_PARAM_KEYS.maxPrice],
    promo: value[CATALOGUE_PARAM_KEYS.promo],
    sizes: value[CATALOGUE_PARAM_KEYS.sizes],
    colors: value[CATALOGUE_PARAM_KEYS.colors],
    ages: value[CATALOGUE_PARAM_KEYS.ages],
    ageBand: value[CATALOGUE_PARAM_KEYS.ageBand],
  }));

export const DEFAULT_CATALOGUE_QUERY: CatalogueQuery = {
  sort: "newest",
  page: 1,
  sizes: [],
  colors: [],
  ages: [],
};

function normalizeSearchParams(
  params: Record<string, string | string[] | undefined>,
): Record<string, string | string[] | undefined> {
  const normalized: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    normalized[key] = value;
  }

  return normalized;
}

export function parseCatalogueQuery(
  params: Record<string, string | string[] | undefined>,
): CatalogueQuery {
  const parsed = catalogueQuerySchema.safeParse(normalizeSearchParams(params));
  if (!parsed.success) {
    return { ...DEFAULT_CATALOGUE_QUERY };
  }

  return parsed.data;
}

export function serializeCatalogueQueryToParams(
  query: CatalogueQuery,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (query.query?.trim()) params[CATALOGUE_PARAM_KEYS.query] = query.query.trim();
  if (query.categorySlug) params[CATALOGUE_PARAM_KEYS.category] = query.categorySlug;
  if (query.gender) params[CATALOGUE_PARAM_KEYS.gender] = query.gender;
  if (query.season?.trim()) params[CATALOGUE_PARAM_KEYS.season] = query.season.trim();
  if (query.sort && query.sort !== "newest")
    params[CATALOGUE_PARAM_KEYS.sort] = query.sort;
  if (query.page && query.page > 1)
    params[CATALOGUE_PARAM_KEYS.page] = String(query.page);
  if (query.minPriceCents != null) {
    params[CATALOGUE_PARAM_KEYS.minPrice] = String(query.minPriceCents / 100);
  }
  if (query.maxPriceCents != null) {
    params[CATALOGUE_PARAM_KEYS.maxPrice] = String(query.maxPriceCents / 100);
  }
  if (query.promo) params[CATALOGUE_PARAM_KEYS.promo] = query.promo;
  if (query.sizes?.length) params[CATALOGUE_PARAM_KEYS.sizes] = query.sizes.join(",");
  if (query.colors?.length)
    params[CATALOGUE_PARAM_KEYS.colors] = query.colors.join(",");
  if (query.ages?.length) params[CATALOGUE_PARAM_KEYS.ages] = query.ages.join(",");
  if (query.ageBand) params[CATALOGUE_PARAM_KEYS.ageBand] = query.ageBand;

  return params;
}

export function buildCatalogueQueryString(query: CatalogueQuery): string {
  return new URLSearchParams(serializeCatalogueQueryToParams(query)).toString();
}
