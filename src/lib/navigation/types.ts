export interface NavDropdownLink {
  label: string;
  href: string;
}

export interface NavDropdownPanel {
  title: string;
  links: NavDropdownLink[];
}

export interface NavLinkItem {
  id: string;
  kind: "link";
  label: string;
  href: string;
}

export interface NavUniverseItem {
  id: string;
  kind: "universe";
  label: string;
  slug: string;
  href: string;
  productCount: number;
  panels: NavDropdownPanel[];
}

export type NavTopItem = NavLinkItem | NavUniverseItem;

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
    | "mail";
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
}
