import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import { buildCatalogueHref } from "@/lib/navigation/catalog-href";
import {
  buildAgePanel,
  buildNeedPanel,
  MAIN_NAV_LABELS,
  MAIN_NAV_UNIVERSE_SLUGS,
  NAV_HREF,
} from "@/lib/navigation/nav-config";
import type {
  NavMobileLink,
  NavMobileSection,
  NavTopItem,
  StorefrontNavigation,
} from "@/lib/navigation/types";
import type { ShopCategory } from "@/lib/shop/types";
import type { ProductListItem } from "@/types/catalog";

function countProductsByCategory(products: ProductListItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) {
    if (!product.categorySlug) continue;
    counts[product.categorySlug] = (counts[product.categorySlug] ?? 0) + 1;
  }
  return counts;
}

function categoryExists(categories: ShopCategory[], slug: string): boolean {
  return categories.some((category) => category.slug === slug);
}

function buildTopItems(
  categories: ShopCategory[],
  categoryCounts: Record<string, number>,
): NavTopItem[] {
  const items: NavTopItem[] = [
    {
      id: "nouveautes",
      kind: "link",
      label: "Nouveautés",
      href: NAV_HREF.nouveautes,
    },
  ];

  const categoryBySlug = new Map(
    categories.map((category) => [category.slug, category]),
  );

  for (const slug of MAIN_NAV_UNIVERSE_SLUGS) {
    if (!categoryExists(categories, slug)) continue;

    const category = categoryBySlug.get(slug);
    const label = MAIN_NAV_LABELS[slug] ?? category?.label ?? slug;

    items.push({
      id: slug,
      kind: "universe",
      label,
      slug,
      href: `/categorie/${slug}`,
      productCount: categoryCounts[slug] ?? 0,
      panels: [buildAgePanel(slug), buildNeedPanel(slug)],
    });
  }

  if (categoryExists(categories, "pyjamas")) {
    items.push({
      id: "pyjamas",
      kind: "link",
      label: MAIN_NAV_LABELS.pyjamas ?? "Pyjamas",
      href: NAV_HREF.pyjamas,
    });
  }

  items.push({
    id: "petits-prix",
    kind: "link",
    label: "Petits prix",
    href: NAV_HREF.petitsPrix,
  });

  items.push({
    id: "guide-tailles",
    kind: "link",
    label: "Guide tailles",
    href: NAV_HREF.guideTailles,
  });

  return items;
}

function buildMobileSections(
  categories: ShopCategory[],
  hasLowPriceProducts: boolean,
): NavMobileSection[] {
  const parcourir: NavMobileLink[] = [
    { label: "Nouveautés", href: NAV_HREF.nouveautes, icon: "sparkles" },
  ];

  for (const slug of MAIN_NAV_UNIVERSE_SLUGS) {
    if (!categoryExists(categories, slug)) continue;
    parcourir.push({
      label: MAIN_NAV_LABELS[slug] ?? slug,
      href: `/categorie/${slug}`,
      icon: slug === "bebe" ? "baby" : slug === "fille" ? "flower-2" : "shirt",
    });
  }

  if (categoryExists(categories, "pyjamas")) {
    parcourir.push({
      label: "Pyjamas",
      href: NAV_HREF.pyjamas,
      icon: "moon",
    });
  }

  parcourir.push({
    label: hasLowPriceProducts ? "Petits prix" : "Bonnes affaires",
    href: NAV_HREF.petitsPrix,
    icon: "tag",
  });

  parcourir.push({
    label: "Guide tailles",
    href: NAV_HREF.guideTailles,
    icon: "ruler",
  });

  const reassurance: NavMobileLink[] = [
    { label: "Livraison point relais", href: NAV_HREF.livraison, icon: "truck" },
    { label: "Retours 14 jours", href: NAV_HREF.livraison, icon: "rotate-ccw" },
    { label: "Mes favoris", href: NAV_HREF.favoris, icon: "heart" },
    { label: "Nous écrire", href: "__contact__", icon: "mail" },
  ];

  return [
    { id: "parcourir", title: "Parcourir", links: parcourir },
    { id: "reassurance", title: "Aide & confiance", links: reassurance },
  ];
}

export function buildStorefrontNavigation(
  categories: ShopCategory[],
  products: ProductListItem[],
): StorefrontNavigation {
  const categoryProductCounts = countProductsByCategory(products);
  const hasLowPriceProducts = filterLowPriceProducts(products).length > 0;
  const topItems = buildTopItems(categories, categoryProductCounts);

  return {
    topItems,
    mobileSections: buildMobileSections(categories, hasLowPriceProducts),
    categoryProductCounts,
    hasLowPriceProducts,
  };
}
