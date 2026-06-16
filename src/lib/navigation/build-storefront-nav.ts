import { buyingGuidesNav } from "@/lib/constants/site";
import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import {
  buildAccessoiresMegaPanels,
  buildMegaMenuFeatured,
  buildPyjamasMegaPanels,
  buildUniverseMegaPanels,
  categoryHasLastPieceProducts,
  categoryHasLowPriceProducts,
  MAIN_NAV_CATEGORY_MEGA_SLUGS,
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
import type { NavDealsAvailability } from "@/lib/navigation/nav-config";
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

function buildDealsAvailability(
  products: ProductListItem[],
  categorySlug: string,
  hasGlobalLowPrice: boolean,
): NavDealsAvailability {
  return {
    hasLowPrice:
      hasGlobalLowPrice && categoryHasLowPriceProducts(products, categorySlug),
    hasLastPiece: categoryHasLastPieceProducts(products, categorySlug),
  };
}

function buildTopItems(
  categories: ShopCategory[],
  products: ProductListItem[],
  categoryCounts: Record<string, number>,
  hasLowPriceProducts: boolean,
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
    const availability = buildDealsAvailability(products, slug, hasLowPriceProducts);

    items.push({
      id: slug,
      kind: "universe",
      label,
      slug,
      href: `/categorie/${slug}`,
      productCount: categoryCounts[slug] ?? 0,
      panels: buildUniverseMegaPanels(slug, availability),
      featured: buildMegaMenuFeatured(slug, label),
    });
  }

  for (const slug of MAIN_NAV_CATEGORY_MEGA_SLUGS) {
    if (!categoryExists(categories, slug)) continue;

    const category = categoryBySlug.get(slug);
    const label = MAIN_NAV_LABELS[slug] ?? category?.label ?? slug;
    const availability = buildDealsAvailability(products, slug, hasLowPriceProducts);
    const panels =
      slug === "pyjamas"
        ? buildPyjamasMegaPanels(availability)
        : buildAccessoiresMegaPanels(availability);

    items.push({
      id: slug,
      kind: "category",
      label,
      slug,
      href: `/categorie/${slug}`,
      productCount: categoryCounts[slug] ?? 0,
      panels,
      featured: buildMegaMenuFeatured(slug, label),
    });
  }

  if (hasLowPriceProducts) {
    items.push({
      id: "petits-prix",
      kind: "link",
      label: "Petits prix",
      href: NAV_HREF.petitsPrix,
    });
  }

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

  for (const slug of MAIN_NAV_CATEGORY_MEGA_SLUGS) {
    if (!categoryExists(categories, slug)) continue;
    parcourir.push({
      label: MAIN_NAV_LABELS[slug] ?? slug,
      href: `/categorie/${slug}`,
      icon: slug === "pyjamas" ? "moon" : "package",
    });
  }

  if (hasLowPriceProducts) {
    parcourir.push({
      label: "Petits prix",
      href: NAV_HREF.petitsPrix,
      icon: "tag",
    });
  }

  parcourir.push({
    label: "Guide tailles",
    href: NAV_HREF.guideTailles,
    icon: "ruler",
  });

  const selections: NavMobileLink[] = [
    { label: "Nuit douce", href: "/rituels/nuit-calme", icon: "moon" },
    { label: "Matin école", href: "/rituels/matin-presse", icon: "shirt" },
    { label: "Bébé cocon", href: "/rituels/bebe-cocon", icon: "baby" },
  ];

  const reassurance: NavMobileLink[] = [
    { label: buyingGuidesNav.label, href: buyingGuidesNav.href, icon: "book-open" },
    { label: "Livraison point relais", href: NAV_HREF.livraison, icon: "truck" },
    { label: "Retours 14 jours", href: NAV_HREF.livraison, icon: "rotate-ccw" },
    { label: "Mes favoris", href: NAV_HREF.favoris, icon: "heart" },
    { label: "Nous écrire", href: "__contact__", icon: "mail" },
  ];

  return [
    { id: "parcourir", title: "Parcourir", links: parcourir },
    { id: "selections", title: "Sélections", links: selections },
    { id: "reassurance", title: "Aide & confiance", links: reassurance },
  ];
}

export function buildStorefrontNavigation(
  categories: ShopCategory[],
  products: ProductListItem[],
): StorefrontNavigation {
  const categoryProductCounts = countProductsByCategory(products);
  const hasLowPriceProducts = filterLowPriceProducts(products).length > 0;
  const topItems = buildTopItems(
    categories,
    products,
    categoryProductCounts,
    hasLowPriceProducts,
  );

  return {
    topItems,
    mobileSections: buildMobileSections(categories, hasLowPriceProducts),
    categoryProductCounts,
    hasLowPriceProducts,
  };
}
