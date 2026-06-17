import { getHomeRituals, type Ritual } from "@/lib/rituals/rituals";
import { pickProductsForRitual } from "@/lib/rituals/pick-ritual-products";
import type { ProductListItem } from "@/types/catalog";

export interface CatalogueCapsuleModule {
  ritual: Ritual;
  products: ProductListItem[];
}

export function getCatalogueCapsuleRituals(categorySlug?: string): Ritual[] {
  const rituals = getHomeRituals();
  if (!categorySlug) return rituals;

  const scoped = rituals.filter(
    (ritual) =>
      ritual.categorySlugs.includes(categorySlug) ||
      ritual.primaryCategorySlug === categorySlug,
  );

  return scoped.length > 0 ? scoped : rituals;
}

export function buildCatalogueCapsuleModules(
  products: ProductListItem[],
  categorySlug?: string,
): CatalogueCapsuleModule[] {
  return getCatalogueCapsuleRituals(categorySlug).map((ritual) => ({
    ritual,
    products: pickProductsForRitual(products, ritual),
  }));
}

export function catalogueCapsulesHaveProducts(
  modules: CatalogueCapsuleModule[],
): boolean {
  return modules.some((module) => module.products.length > 0);
}
