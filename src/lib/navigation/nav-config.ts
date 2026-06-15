import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";
import type { NavDropdownLink, NavDropdownPanel } from "@/lib/navigation/types";

/** Entrées principales (ordre d'affichage). */
export const MAIN_NAV_UNIVERSE_SLUGS = ["bebe", "fille", "garcon"] as const;

export const MAIN_NAV_LABELS: Record<string, string> = {
  bebe: "Bébé",
  fille: "Fille",
  garcon: "Garçon",
  pyjamas: "Pyjamas",
};

export const NAV_HREF = {
  nouveautes: "/#home-nouveautes",
  petitsPrix: "/catalogue?promo=petit-prix",
  guideTailles: "/#home-guide-tailles",
  pyjamas: "/categorie/pyjamas",
  livraison: "/livraison-retours",
  favoris: "/favoris",
} as const;

/** Tranches d'âge parent-friendly (filtres catalogue). */
export const NAV_AGE_BANDS = [
  { label: "0-3 mois", value: "0-3 mois" },
  { label: "3-12 mois", value: "3-12 mois" },
  { label: "1-3 ans", value: "1-3 ans" },
  { label: "4-8 ans", value: "4-8 ans" },
] as const;

export function buildAgePanel(categorySlug: string): NavDropdownPanel {
  return {
    title: "Par âge",
    links: NAV_AGE_BANDS.map(({ label, value }) => ({
      label,
      href: buildCategoryHref(categorySlug, { ages: [value] }),
    })),
  };
}

type NeedLinkDef = {
  label: string;
  href: (slug: string) => string;
};

const UNIVERSE_NEED_LINKS: NeedLinkDef[] = [
  {
    label: "Bodies",
    href: (slug) => buildCategoryHref(slug, { query: "body" }),
  },
  {
    label: "Pyjamas",
    href: () => NAV_HREF.pyjamas,
  },
  {
    label: "Pulls & sweats",
    href: (slug) => buildCategoryHref(slug, { query: "pull" }),
  },
  {
    label: "Pantalons",
    href: (slug) => buildCategoryHref(slug, { query: "pantalon" }),
  },
  {
    label: "Accessoires",
    href: () => "/categorie/accessoires",
  },
];

export function buildNeedPanel(categorySlug: string): NavDropdownPanel {
  return {
    title: "Par besoin",
    links: UNIVERSE_NEED_LINKS.map(({ label, href }) => ({
      label,
      href: href(categorySlug),
    })),
  };
}

export function buildUniverseFooterLink(
  categorySlug: string,
  label: string,
): NavDropdownLink {
  return {
    label: `Tout ${label.toLowerCase()}`,
    href: `/categorie/${categorySlug}`,
  };
}

export function buildNouveautesCategoryLink(categorySlug: string): NavDropdownLink {
  return {
    label: "Nouveautés",
    href: buildCatalogueHref({ categorySlug, sort: "newest" }),
  };
}

export const NAV_REASSURANCE_DESKTOP = [
  { id: "livraison", label: "Livraison", href: NAV_HREF.livraison },
  { id: "retours", label: "Retours", href: NAV_HREF.livraison },
  { id: "favoris", label: "Favoris", href: NAV_HREF.favoris },
] as const;
