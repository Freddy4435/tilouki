import { CATALOGUE_AGE_BANDS } from "@/lib/catalog/catalogue-age-bands";
import { buyingGuidesNav } from "@/lib/constants/site";
import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";
import { getRitualBySlug } from "@/lib/rituals/rituals";
import type {
  NavDropdownLink,
  NavDropdownPanel,
  NavMegaMenuFeatured,
} from "@/lib/navigation/types";

/** Entrées principales (ordre d'affichage). */
export const MAIN_NAV_UNIVERSE_SLUGS = ["bebe", "fille", "garcon"] as const;

export const MAIN_NAV_CATEGORY_MEGA_SLUGS = ["pyjamas", "accessoires"] as const;

export const MAIN_NAV_LABELS: Record<string, string> = {
  bebe: "Bébé",
  fille: "Fille",
  garcon: "Garçon",
  pyjamas: "Pyjamas",
  accessoires: "Accessoires",
};

export const NAV_HREF = {
  nouveautes: buildCatalogueHref({ sort: "newest" }),
  arrivageMercredi: "/#home-arrivage-mercredi",
  capsules: "/catalogue?vue=capsules",
  rayons: "/catalogue?vue=rayons",
  dernieresTailles: "/#home-dernieres-tailles",
  petitsPrix: "/catalogue?promo=petit-prix",
  guideTailles: "/guide-tailles",
  pyjamas: "/categorie/pyjamas",
  accessoires: "/categorie/accessoires",
  livraison: "/livraison-retours",
  favoris: "/favoris",
  blog: "/blog",
} as const;

/** Capsules shopping — liens explicites vers pages rituel. */
export const NAV_CAPSULE_MOMENTS = [
  { label: "Nuit douce", ritualSlug: "nuit-calme" },
  { label: "Matin école", ritualSlug: "matin-presse" },
  { label: "Jour de pluie", ritualSlug: "jour-de-pluie" },
  { label: "Bébé cocon", ritualSlug: "bebe-cocon" },
] as const;

const UNIVERSE_RAYON_LINKS: Record<string, NavDropdownLink[]> = {
  bebe: [
    { label: "Bodies", href: buildCategoryHref("bodies") },
    { label: "Pyjamas bébé", href: buildCategoryHref("pyjamas") },
    { label: "Ensembles", href: buildCategoryHref("ensembles") },
    { label: "Tout le rayon bébé", href: buildCategoryHref("bebe") },
  ],
  fille: [
    { label: "Robes", href: buildCategoryHref("robes") },
    { label: "Pyjamas", href: buildCategoryHref("pyjamas") },
    { label: "Pluie", href: buildCategoryHref("pluie") },
    { label: "Tout le rayon fille", href: buildCategoryHref("fille") },
  ],
  garcon: [
    { label: "Pluie", href: buildCategoryHref("pluie") },
    { label: "Pyjamas", href: buildCategoryHref("pyjamas") },
    { label: "Ensembles", href: buildCategoryHref("ensembles") },
    { label: "Tout le rayon garçon", href: buildCategoryHref("garcon") },
  ],
};

const PYJAMAS_RAYON_LINKS: NavDropdownLink[] = [
  { label: "Pyjamas fille", href: buildCategoryHref("pyjamas") },
  { label: "Rayon bébé", href: buildCategoryHref("bebe") },
  { label: "Capsules nuit", href: NAV_HREF.capsules },
  { label: "Tout pyjamas", href: buildCategoryHref("pyjamas") },
];

const ACCESSOIRES_RAYON_LINKS: NavDropdownLink[] = [
  { label: "Accessoires bébé", href: buildCategoryHref("accessoires") },
  { label: "Rayon bébé", href: buildCategoryHref("bebe") },
  { label: "Tous les rayons", href: NAV_HREF.rayons },
  { label: "Tout accessoires", href: buildCategoryHref("accessoires") },
];

const LOW_STOCK_THRESHOLD = 3;

export interface NavDealsAvailability {
  hasLowPrice: boolean;
  hasLastPiece: boolean;
}

export function filterNavLinksByCategories(
  links: NavDropdownLink[],
  availableSlugs: ReadonlySet<string>,
): NavDropdownLink[] {
  const filtered = links.filter((link) => {
    const match = link.href.match(/^\/categorie\/([a-z0-9-]+)/);
    if (!match?.[1]) return true;
    return availableSlugs.has(match[1]);
  });

  return filtered.length > 0 ? filtered : links.slice(0, 1);
}

export function buildAgePanel(categorySlug: string): NavDropdownPanel {
  return {
    title: "Par âge",
    links: CATALOGUE_AGE_BANDS.map((band) => ({
      label: `${band.label} · ${band.hint}`,
      href: buildCategoryHref(categorySlug, { ageBand: band.value }),
    })),
  };
}

export function buildNowPanel(categorySlug: string): NavDropdownPanel {
  return {
    title: "En ce moment",
    links: [
      {
        label: "Nouveautés",
        href: buildCatalogueHref({ categorySlug, sort: "newest" }),
      },
      { label: "Arrivage du mercredi", href: NAV_HREF.arrivageMercredi },
      { label: "Capsules du catalogue", href: NAV_HREF.capsules },
    ],
  };
}

export function buildRayonsPanel(
  categorySlug: string,
  availableSlugs: ReadonlySet<string>,
): NavDropdownPanel {
  const defs = UNIVERSE_RAYON_LINKS[categorySlug] ?? [
    { label: "Voir le rayon", href: buildCategoryHref(categorySlug) },
  ];

  return {
    title: "Rayons",
    links: filterNavLinksByCategories(defs, availableSlugs),
  };
}

export function buildMomentsPanel(categorySlug: string): NavDropdownPanel {
  const relevant = NAV_CAPSULE_MOMENTS.filter(({ ritualSlug }) => {
    const ritual = getRitualBySlug(ritualSlug);
    if (!ritual) return false;
    return (
      ritual.categorySlugs.includes(categorySlug) ||
      ritual.primaryCategorySlug === categorySlug
    );
  });

  const moments = relevant.length > 0 ? relevant : NAV_CAPSULE_MOMENTS;

  return {
    title: "Par moment",
    links: moments.map(({ label, ritualSlug }) => ({
      label,
      href: `/rituels/${ritualSlug}`,
    })),
  };
}

export function buildDealsPanel(
  categorySlug: string,
  availability: NavDealsAvailability,
): NavDropdownPanel | null {
  const links: NavDropdownLink[] = [];

  if (availability.hasLowPrice) {
    links.push({
      label: "Petits prix",
      href: buildCatalogueHref({ categorySlug, promo: "petit-prix" }),
    });
  }

  if (availability.hasLastPiece) {
    links.push({
      label: "Dernières pièces",
      href: buildCategoryHref(categorySlug),
    });
  }

  if (links.length === 0) return null;

  return {
    title: "Bonnes affaires",
    links,
  };
}

export function buildUniverseMegaPanels(
  categorySlug: string,
  availability: NavDealsAvailability,
  availableSlugs: ReadonlySet<string>,
): NavDropdownPanel[] {
  const panels = [
    buildNowPanel(categorySlug),
    buildAgePanel(categorySlug),
    buildMomentsPanel(categorySlug),
    buildRayonsPanel(categorySlug, availableSlugs),
    buildDealsPanel(categorySlug, availability),
  ];

  return panels.filter((panel): panel is NavDropdownPanel => panel != null);
}

export function buildPyjamasMegaPanels(
  availability: NavDealsAvailability,
): NavDropdownPanel[] {
  const panels: NavDropdownPanel[] = [
    {
      title: "En ce moment",
      links: [
        { label: "Nouveautés", href: buildCategoryHref("pyjamas", { sort: "newest" }) },
        { label: "Arrivage du mercredi", href: NAV_HREF.arrivageMercredi },
        { label: "Capsules du catalogue", href: NAV_HREF.capsules },
      ],
    },
    buildAgePanel("pyjamas"),
    {
      title: "Par moment",
      links: [
        { label: "Nuit douce", href: "/rituels/nuit-calme" },
        { label: "Bébé cocon", href: "/rituels/bebe-cocon" },
      ],
    },
    {
      title: "Rayons",
      links: PYJAMAS_RAYON_LINKS,
    },
  ];

  const deals = buildDealsPanel("pyjamas", availability);
  if (deals) panels.push(deals);

  return panels;
}

export function buildAccessoiresMegaPanels(
  availability: NavDealsAvailability,
): NavDropdownPanel[] {
  const panels: NavDropdownPanel[] = [
    {
      title: "En ce moment",
      links: [
        {
          label: "Nouveautés",
          href: buildCategoryHref("accessoires", { sort: "newest" }),
        },
        { label: "Tous les rayons", href: NAV_HREF.rayons },
      ],
    },
    buildAgePanel("accessoires"),
    {
      title: "Par moment",
      links: [{ label: "Bébé cocon", href: "/rituels/bebe-cocon" }],
    },
    {
      title: "Rayons",
      links: ACCESSOIRES_RAYON_LINKS,
    },
  ];

  const deals = buildDealsPanel("accessoires", availability);
  if (deals) panels.push(deals);

  return panels;
}

export function buildMegaMenuFeatured(
  categorySlug: string,
  label: string,
): NavMegaMenuFeatured {
  return {
    title: `Nouveautés ${label.toLowerCase()}`,
    description: "Pièces en stock — tailles affichées sur chaque fiche.",
    href: buildCatalogueHref({ categorySlug, sort: "newest" }),
    imageSlug: categorySlug,
    imageKind: "category",
  };
}

export function buildPyjamasMegaFeatured(): NavMegaMenuFeatured {
  return {
    title: "Nuit douce",
    description: "Pyjamas et ensembles nuit — composer la capsule.",
    href: "/rituels/nuit-calme",
    imageSlug: "nuit-calme",
    imageKind: "ritual",
  };
}

export function buildPetitsPrixFeatured(): NavMegaMenuFeatured {
  return {
    title: "Petits prix",
    description: "Essentiels remisés pour compléter la garde-robe.",
    href: NAV_HREF.petitsPrix,
    imageSlug: "home-petits-prix",
    imageKind: "editorial",
  };
}

export function categoryHasLowPriceProducts(
  products: {
    categorySlug?: string | null;
    minPriceCents: number;
    compareAtPriceCents?: number | null;
    badges?: readonly string[];
  }[],
  categorySlug: string,
): boolean {
  return products.some(
    (product) =>
      product.categorySlug === categorySlug &&
      (product.badges?.includes("low-price") ||
        (product.compareAtPriceCents != null &&
          product.compareAtPriceCents > product.minPriceCents)),
  );
}

export function categoryHasLastPieceProducts(
  products: { categorySlug?: string | null; totalStock: number }[],
  categorySlug: string,
): boolean {
  return products.some(
    (product) =>
      product.categorySlug === categorySlug &&
      product.totalStock > 0 &&
      product.totalStock <= LOW_STOCK_THRESHOLD,
  );
}

export function catalogHasLastPieceProducts(
  products: { totalStock: number }[],
): boolean {
  return products.some(
    (product) => product.totalStock > 0 && product.totalStock <= LOW_STOCK_THRESHOLD,
  );
}

export const NAV_REASSURANCE_DESKTOP = [
  { id: "guides-achat", label: buyingGuidesNav.label, href: buyingGuidesNav.href },
  { id: "livraison", label: "Livraison", href: NAV_HREF.livraison },
  { id: "retours", label: "Retours", href: NAV_HREF.livraison },
  { id: "favoris", label: "Favoris", href: NAV_HREF.favoris },
] as const;
