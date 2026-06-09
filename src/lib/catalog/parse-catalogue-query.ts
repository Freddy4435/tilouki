import type { CatalogueQuery } from "@/types/catalog";
import type { ProductGender } from "@/types/database";

const GENDERS: ProductGender[] = ["fille", "garcon", "mixte"];

export function parseCatalogueQuery(
  params: Record<string, string | string[] | undefined>,
): CatalogueQuery {
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Number(get("page") ?? "1");
  const minPrice = get("prix_min");
  const maxPrice = get("prix_max");
  const genre = get("genre");
  const sort = get("tri");

  return {
    categorySlug: get("categorie"),
    query: get("q"),
    gender: GENDERS.find((g) => g === genre),
    season: get("saison"),
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "name_asc" || sort === "newest"
        ? sort
        : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    minPriceCents: minPrice ? Math.round(Number(minPrice) * 100) : undefined,
    maxPriceCents: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined,
    promo: get("promo") === "petit-prix" ? "petit-prix" : undefined,
  };
}
