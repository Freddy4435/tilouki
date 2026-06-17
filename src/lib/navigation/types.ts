export interface NavDropdownLink {
  label: string;
  href: string;
}

export interface NavDropdownPanel {
  title: string;
  links: NavDropdownLink[];
}

/** Mise en avant visuelle dans le mega-menu desktop. */
export interface NavMegaMenuFeatured {
  title: string;
  description: string;
  href: string;
  /** Slug catégorie, rituel ou id module éditorial pour le visuel Tilouki. */
  imageSlug: string;
  imageKind: "category" | "editorial" | "ritual";
}

export interface NavMegaMenuBase {
  panels: NavDropdownPanel[];
  featured?: NavMegaMenuFeatured;
}

export interface NavLinkItem {
  id: string;
  kind: "link";
  label: string;
  href: string;
}

export interface NavUniverseItem extends NavMegaMenuBase {
  id: string;
  kind: "universe";
  label: string;
  slug: string;
  href: string;
  productCount: number;
}

export interface NavCategoryMegaItem extends NavMegaMenuBase {
  id: string;
  kind: "category";
  label: string;
  slug: string;
  href: string;
  productCount: number;
}

export type NavMegaMenuItem = NavUniverseItem | NavCategoryMegaItem;

export type NavTopItem = NavLinkItem | NavMegaMenuItem;

export interface NavMobileLink {
  label: string;
  href: string;
  icon?:
    | "sparkles"
    | "baby"
    | "flower-2"
    | "shirt"
    | "moon"
    | "tag"
    | "ruler"
    | "truck"
    | "rotate-ccw"
    | "heart"
    | "mail"
    | "book-open"
    | "package"
    | "cloud-rain";
}

export interface NavMobileSection {
  id: string;
  title: string;
  links: NavMobileLink[];
}

export interface StorefrontNavigation {
  topItems: NavTopItem[];
  mobileSections: NavMobileSection[];
  categoryProductCounts: Record<string, number>;
  hasLowPriceProducts: boolean;
  hasLastPieceProducts: boolean;
}
