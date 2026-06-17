import { buildCatalogueHref } from "@/lib/navigation/catalog-href";
import { isProductStorefrontListed } from "@/lib/catalog/product-sellability";
import { getHomeRituals, type Ritual, type RitualEmptyCta } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

export const RITUAL_CAPSULE_TOTAL_MIN = 2;

export const RITUAL_CAPSULE_PRIMARY_CTA = "Composer cette capsule";
export const RITUAL_CAPSULE_SIZES_CTA = "Voir toutes les tailles";

export function getRitualCapsuleHref(slug: string): string {
  return `/rituels/${slug}`;
}

export function listStorefrontRitualProducts(
  products: ProductListItem[],
): ProductListItem[] {
  return products.filter(isProductStorefrontListed);
}

export function estimateRitualCapsuleTotalCents(products: ProductListItem[]): number {
  return listStorefrontRitualProducts(products).reduce(
    (sum, product) => sum + product.minPriceCents,
    0,
  );
}

export function shouldShowRitualCapsuleTotal(products: ProductListItem[]): boolean {
  return listStorefrontRitualProducts(products).length >= RITUAL_CAPSULE_TOTAL_MIN;
}

/** Capsules shopping proches — mêmes catégories, jamais de blog. */
export function buildNearbyCapsuleAlternatives(ritual: Ritual): RitualEmptyCta[] {
  const all = getHomeRituals().filter((item) => item.slug !== ritual.slug);
  const related = all.filter((item) =>
    item.categorySlugs.some((slug) => ritual.categorySlugs.includes(slug)),
  );
  const picks = (related.length > 0 ? related : all).slice(0, 3);

  return picks.map((item) => ({
    label: item.title,
    href: getRitualCapsuleHref(item.slug),
  }));
}

/** Alternatives rayons + nouveautés — jamais de lien blog. */
export function buildRitualEmptyAlternatives(ritual: Ritual): RitualEmptyCta[] {
  const nouveautesHref = buildCatalogueHref({ sort: "newest" });
  const nouveautes: RitualEmptyCta = {
    label: "Voir les nouveautés",
    href: nouveautesHref,
  };

  const rayons = ritual.emptyStateCtas.filter((cta) => cta.href !== nouveautesHref);
  const merged = [...rayons, nouveautes];
  const seen = new Set<string>();

  return merged.filter((cta) => {
    if (seen.has(cta.href)) return false;
    seen.add(cta.href);
    return !cta.href.startsWith("/blog");
  });
}
