import { filterLowPriceProducts, sortProducts } from "@/lib/catalog/sort-products";
import type { ProductListItem } from "@/types/catalog";

export const HOME_PRODUCT_LIMIT = 8;
export const MIN_HOME_SECTION_PRODUCTS = 3;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const LOW_STOCK_THRESHOLD = 3;

export interface ReadyLook {
  id: string;
  title: string;
  hook: string;
  tip: string;
  href: string;
  products: ProductListItem[];
  /** Conseil sans produits associés (fallback éditorial). */
  editorialOnly?: boolean;
}

const LOOK_THEMES = [
  {
    id: "nuit-douce",
    title: "Nuit tout doux",
    categorySlug: "pyjamas",
    hook: "Un pyjama moelleux et des chaussettes : le rituel du soir en deux temps.",
    tip: "Choisissez une taille légèrement ample pour les nuits agitées.",
  },
  {
    id: "bebe-cocon",
    title: "Cocon bébé",
    categorySlug: "bebe",
    hook: "Bodies et gigoteuses qui s'associent sans prise de tête au change.",
    tip: "Prévoyez deux bodies par jour de garde — le linge part vite !",
  },
  {
    id: "ecole-pret",
    title: "Prêt pour l'école",
    categorySlug: "garcon",
    hook: "Tee-shirt, jogging et sweat : l'essentiel des matins pressés.",
    tip: "Privilégiez le coton pour le confort à la récré.",
  },
  {
    id: "mercredi-couleur",
    title: "Mercredi en couleurs",
    categorySlug: "fille",
    hook: "Une robe ou un tee-shirt fleuri pour égayer le milieu de semaine.",
    tip: "Associez avec un legging doux pour jouer librement.",
  },
] as const;

const EDITORIAL_LOOKS_FALLBACK: ReadyLook[] = [
  {
    id: "conseil-tailles",
    title: "Bien choisir la taille",
    hook: "Entre deux âges ? Montez d'un cran : vos enfants grandissent vite.",
    tip: "Chaque fiche indique la taille ou l'âge en stock — pas de surprise au panier.",
    href: "#home-guide-tailles",
    products: [],
    editorialOnly: true,
  },
  {
    id: "conseil-nuit",
    title: "Rituels du soir",
    hook: "Pyjama respirant, température de chambre fraîche : des nuits plus sereines.",
    tip: "Gardez deux pyjamas en rotation pour les petits accidents nocturnes.",
    href: "/categorie/pyjamas",
    products: [],
    editorialOnly: true,
  },
  {
    id: "conseil-couche",
    title: "Change sans stress",
    hook: "Bodies à pression et gigoteuses zippées : moins de manipulations, plus de câlins.",
    tip: "Superposez body + pyjama léger quand les nuits sont fraîches.",
    href: "/categorie/bebe",
    products: [],
    editorialOnly: true,
  },
];

export function hasMinimumHomeProducts(
  products: ProductListItem[],
  min = MIN_HOME_SECTION_PRODUCTS,
): boolean {
  return products.length >= min;
}

/** Début du mercredi courant (ou précédent) à minuit, heure locale. */
export function getCurrentWednesdayStart(now = new Date()): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const daysSinceWednesday = (day + 7 - 3) % 7;
  start.setDate(start.getDate() - daysSinceWednesday);
  return start;
}

/** Produits ajoutés depuis le dernier mercredi 00:00. */
export function pickWednesdayNewProducts(
  products: ProductListItem[],
  now = Date.now(),
): ProductListItem[] {
  const wednesdayStart = getCurrentWednesdayStart(new Date(now)).getTime();

  return sortProducts(
    products.filter((product) => {
      const created = new Date(product.createdAt).getTime();
      return !Number.isNaN(created) && created >= wednesdayStart;
    }),
    "newest",
  ).slice(0, HOME_PRODUCT_LIMIT);
}

/** Produits ajoutés dans les 7 derniers jours. */
export function pickWeeklyNewProducts(
  products: ProductListItem[],
  now = Date.now(),
): ProductListItem[] {
  return sortProducts(
    products.filter((product) => {
      const created = new Date(product.createdAt).getTime();
      if (Number.isNaN(created)) return false;
      const ageMs = now - created;
      return ageMs >= 0 && ageMs <= WEEK_MS;
    }),
    "newest",
  ).slice(0, HOME_PRODUCT_LIMIT);
}

/** Nouveautés de la semaine, sinon dernières arrivées du catalogue. */
export function resolveWeeklyNewProducts(
  products: ProductListItem[],
  now = Date.now(),
): ProductListItem[] {
  const weekly = pickWeeklyNewProducts(products, now);
  if (weekly.length > 0) return weekly;
  return sortProducts(products, "newest").slice(0, HOME_PRODUCT_LIMIT);
}

export function pickLowPriceHomeProducts(
  products: ProductListItem[],
): ProductListItem[] {
  return filterLowPriceProducts(products).slice(0, HOME_PRODUCT_LIMIT);
}

/** Stock faible ou dernière pièce — tri du plus urgent au moins urgent. */
export function pickLastPieceProducts(products: ProductListItem[]): ProductListItem[] {
  return [...products]
    .filter(
      (product) => product.totalStock > 0 && product.totalStock <= LOW_STOCK_THRESHOLD,
    )
    .sort((left, right) => {
      if (left.totalStock !== right.totalStock) {
        return left.totalStock - right.totalStock;
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    })
    .slice(0, HOME_PRODUCT_LIMIT);
}

export function pickCategoryProducts(
  products: ProductListItem[],
  categorySlug: string,
  limit = HOME_PRODUCT_LIMIT,
): ProductListItem[] {
  const inCategory = products.filter(
    (product) => product.categorySlug === categorySlug,
  );
  const withPhoto = inCategory.filter((product) => product.primaryImageUrl);
  const pool = withPhoto.length >= MIN_HOME_SECTION_PRODUCTS ? withPhoto : inCategory;

  return sortProducts(pool, "newest").slice(0, limit);
}

/** Looks prêts : 2–3 produits par thème, ou conseils éditoriaux. */
export function buildReadyLooks(products: ProductListItem[]): ReadyLook[] {
  const looks: ReadyLook[] = [];

  for (const theme of LOOK_THEMES) {
    const inCategory = sortProducts(
      products.filter(
        (product) =>
          product.categorySlug === theme.categorySlug && product.primaryImageUrl,
      ),
      "newest",
    );

    if (inCategory.length >= 2) {
      looks.push({
        id: theme.id,
        title: theme.title,
        hook: theme.hook,
        tip: theme.tip,
        href: `/categorie/${theme.categorySlug}`,
        products: inCategory.slice(0, 3),
      });
    }

    if (looks.length >= 3) break;
  }

  if (looks.length > 0) return looks;
  return EDITORIAL_LOOKS_FALLBACK;
}
