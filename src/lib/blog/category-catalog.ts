import type { BlogCategory } from "@/content/blog/articles";
import { NAV_HREF } from "@/lib/navigation/nav-config";

export type BlogArticlePrimaryCta = "guide-tailles" | "catalogue";

export interface BlogCategoryCatalogMeta {
  categorySlugs: string[];
  productSectionTitle: string;
  productSectionDescription: string;
  primaryCta: BlogArticlePrimaryCta;
  catalogueHref: string;
}

export const BLOG_CATEGORY_CATALOG: Record<BlogCategory, BlogCategoryCatalogMeta> = {
  tailles: {
    categorySlugs: ["bebe", "fille", "garcon"],
    productSectionTitle: "Pièces à comparer",
    productSectionDescription:
      "Des vêtements du quotidien pour mettre en pratique le guide des tailles.",
    primaryCta: "guide-tailles",
    catalogueHref: "/catalogue",
  },
  matieres: {
    categorySlugs: ["bebe", "fille", "garcon"],
    productSectionTitle: "Matières au quotidien",
    productSectionDescription:
      "Une sélection où le confort et la composition comptent vraiment.",
    primaryCta: "catalogue",
    catalogueHref: "/catalogue",
  },
  bebe: {
    categorySlugs: ["bebe"],
    productSectionTitle: "Essentiels bébé",
    productSectionDescription:
      "Bodies, pyjamas et pièces douces pour les premiers mois.",
    primaryCta: "guide-tailles",
    catalogueHref: "/categorie/bebe",
  },
  quotidien: {
    categorySlugs: ["pyjamas", "fille", "garcon"],
    productSectionTitle: "Pour le quotidien",
    productSectionDescription:
      "Pyjamas, basiques et pièces faciles à enfiler au rythme des journées.",
    primaryCta: "catalogue",
    catalogueHref: "/catalogue",
  },
  entretien: {
    categorySlugs: ["bebe", "fille", "garcon", "pyjamas"],
    productSectionTitle: "Vêtements faciles à vivre",
    productSectionDescription:
      "Des pièces pensées pour être portées, lavées et reprises sans stress.",
    primaryCta: "catalogue",
    catalogueHref: "/catalogue",
  },
  budget: {
    categorySlugs: ["bebe", "fille", "garcon", "pyjamas", "accessoires"],
    productSectionTitle: "Bonnes affaires",
    productSectionDescription:
      "Des basiques utiles à prix doux — confort et tailles affichées clairement.",
    primaryCta: "catalogue",
    catalogueHref: NAV_HREF.petitsPrix,
  },
};

export function getBlogCategoryCatalogMeta(
  category: BlogCategory,
): BlogCategoryCatalogMeta {
  return BLOG_CATEGORY_CATALOG[category];
}

export function resolveBlogArticleCta(
  category: BlogCategory,
  catalogueHasProducts: boolean,
): BlogArticlePrimaryCta {
  const preferred = BLOG_CATEGORY_CATALOG[category].primaryCta;
  if (!catalogueHasProducts && preferred === "catalogue") {
    return "guide-tailles";
  }
  return preferred;
}
