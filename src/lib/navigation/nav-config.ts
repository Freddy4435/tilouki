import { buyingGuidesNav } from "@/lib/constants/site";
import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";
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
  nouveautes: "/#home-vestiaire",
  petitsPrix: "/catalogue?promo=petit-prix",
  guideTailles: "/guide-tailles",
  pyjamas: "/categorie/pyjamas",
  accessoires: "/categorie/accessoires",
  livraison: "/livraison-retours",
  favoris: "/favoris",
  blog: "/blog",
} as const;

/** Tranches d'âge parent-friendly (filtres catalogue). */
export const NAV_AGE_BANDS = [
  { label: "0-3 mois", value: "0-3 mois" },
  { label: "3-12 mois", value: "3-12 mois" },
  { label: "1-3 ans", value: "1-3 ans" },
  { label: "4-8 ans", value: "4-8 ans" },
] as const;

type RayonLinkDef = {
  label: string;
  href: (slug: string) => string;
};

const UNIVERSE_RAYON_LINKS: Record<string, RayonLinkDef[]> = {
  bebe: [
    { label: "Bodies", href: (slug) => buildCategoryHref(slug, { query: "body" }) },
    {
      label: "Pyjamas bébé",
      href: (slug) => buildCategoryHref(slug, { query: "pyjama" }),
    },
    {
      label: "Gigoteuses",
      href: (slug) => buildCategoryHref(slug, { query: "gigoteuse" }),
    },
    {
      label: "Ensembles",
      href: (slug) => buildCategoryHref(slug, { query: "ensemble" }),
    },
  ],
  fille: [
    { label: "Robes", href: (slug) => buildCategoryHref(slug, { query: "robe" }) },
    {
      label: "Tee-shirts",
      href: (slug) => buildCategoryHref(slug, { query: "tee" }),
    },
    {
      label: "Leggings",
      href: (slug) => buildCategoryHref(slug, { query: "legging" }),
    },
    {
      label: "Pulls & sweats",
      href: (slug) => buildCategoryHref(slug, { query: "pull" }),
    },
  ],
  garcon: [
    {
      label: "Tee-shirts",
      href: (slug) => buildCategoryHref(slug, { query: "tee" }),
    },
    {
      label: "Joggers",
      href: (slug) => buildCategoryHref(slug, { query: "jogger" }),
    },
    {
      label: "Sweats",
      href: (slug) => buildCategoryHref(slug, { query: "sweat" }),
    },
    {
      label: "Pantalons",
      href: (slug) => buildCategoryHref(slug, { query: "pantalon" }),
    },
  ],
};

const PYJAMAS_RAYON_LINKS: NavDropdownLink[] = [
  { label: "Pyjamas fille", href: buildCategoryHref("pyjamas", { query: "fille" }) },
  { label: "Pyjamas garçon", href: buildCategoryHref("pyjamas", { query: "garçon" }) },
  { label: "Pyjamas bébé", href: buildCategoryHref("pyjamas", { query: "bébé" }) },
  {
    label: "Ensembles nuit",
    href: buildCategoryHref("pyjamas", { query: "ensemble" }),
  },
];

const ACCESSOIRES_RAYON_LINKS: NavDropdownLink[] = [
  {
    label: "Chaussettes",
    href: buildCategoryHref("accessoires", { query: "chaussette" }),
  },
  { label: "Bonnet", href: buildCategoryHref("accessoires", { query: "bonnet" }) },
  { label: "Bavoirs", href: buildCategoryHref("accessoires", { query: "bavoir" }) },
];

const UNIVERSE_SELECTION_LINKS: Record<
  string,
  readonly { label: string; ritualSlug: string }[]
> = {
  bebe: [
    { label: "Bébé cocon", ritualSlug: "bebe-cocon" },
    { label: "Nuit douce", ritualSlug: "nuit-calme" },
  ],
  fille: [
    { label: "Matin école", ritualSlug: "matin-presse" },
    { label: "Jour de pluie", ritualSlug: "jour-de-pluie" },
    { label: "Petits prix", ritualSlug: "petit-budget" },
  ],
  garcon: [
    { label: "Matin école", ritualSlug: "matin-presse" },
    { label: "Jour de pluie", ritualSlug: "jour-de-pluie" },
    { label: "Petits prix", ritualSlug: "petit-budget" },
  ],
};

const LOW_STOCK_THRESHOLD = 3;

export function buildAgePanel(categorySlug: string): NavDropdownPanel {
  return {
    title: "Par âge",
    links: NAV_AGE_BANDS.map(({ label, value }) => ({
      label,
      href: buildCategoryHref(categorySlug, { ages: [value] }),
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
      { label: "Arrivage du mercredi", href: NAV_HREF.nouveautes },
    ],
  };
}

export function buildRayonsPanel(categorySlug: string): NavDropdownPanel {
  const defs = UNIVERSE_RAYON_LINKS[categorySlug] ?? [];
  return {
    title: "Rayons",
    links: defs.map(({ label, href }) => ({
      label,
      href: href(categorySlug),
    })),
  };
}

export function buildSelectionsPanel(categorySlug: string): NavDropdownPanel {
  const selections = UNIVERSE_SELECTION_LINKS[categorySlug] ?? [];
  return {
    title: "Sélections",
    links: selections.map(({ label, ritualSlug }) => ({
      label,
      href: `/rituels/${ritualSlug}`,
    })),
  };
}

export interface NavDealsAvailability {
  hasLowPrice: boolean;
  hasLastPiece: boolean;
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
      href: buildCatalogueHref({ categorySlug, sort: "newest" }),
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
): NavDropdownPanel[] {
  const panels = [
    buildNowPanel(categorySlug),
    buildRayonsPanel(categorySlug),
    buildAgePanel(categorySlug),
    buildSelectionsPanel(categorySlug),
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
        {
          label: "Nouveautés",
          href: buildCategoryHref("pyjamas", { sort: "newest" }),
        },
        { label: "Arrivage du mercredi", href: NAV_HREF.nouveautes },
      ],
    },
    {
      title: "Rayons",
      links: PYJAMAS_RAYON_LINKS,
    },
    buildAgePanel("pyjamas"),
    {
      title: "Sélections",
      links: [{ label: "Nuit douce", href: "/rituels/nuit-calme" }],
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
      ],
    },
    {
      title: "Rayons",
      links: ACCESSOIRES_RAYON_LINKS,
    },
    buildAgePanel("accessoires"),
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

export const NAV_REASSURANCE_DESKTOP = [
  { id: "guides-achat", label: buyingGuidesNav.label, href: buyingGuidesNav.href },
  { id: "livraison", label: "Livraison", href: NAV_HREF.livraison },
  { id: "retours", label: "Retours", href: NAV_HREF.livraison },
  { id: "favoris", label: "Favoris", href: NAV_HREF.favoris },
] as const;
