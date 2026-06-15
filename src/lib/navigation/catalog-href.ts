import {
  buildCatalogueQueryString,
  DEFAULT_CATALOGUE_QUERY,
} from "@/lib/catalog/parse-catalogue-query";
import type { CatalogueQuery } from "@/types/catalog";

export function buildCatalogueHref(params: Partial<CatalogueQuery> = {}): string {
  const query = { ...DEFAULT_CATALOGUE_QUERY, ...params };
  const qs = buildCatalogueQueryString(query);
  return qs ? `/catalogue?${qs}` : "/catalogue";
}

export function buildCategoryHref(
  slug: string,
  params: Partial<Omit<CatalogueQuery, "categorySlug">> = {},
): string {
  const qs = buildCatalogueQueryString({
    ...DEFAULT_CATALOGUE_QUERY,
    ...params,
    categorySlug: slug,
  });
  return qs ? `/categorie/${slug}?${qs}` : `/categorie/${slug}`;
}
