import {
  variantMatchesAgeBand,
  type CatalogueAgeBand,
} from "@/lib/catalog/catalogue-age-bands";
import { HOME_RAYONS } from "@/lib/catalog/home-sections";
import { filterLowPriceProducts } from "@/lib/catalog/sort-products";
import { buildCatalogueHref, buildCategoryHref } from "@/lib/navigation/catalog-href";
import { pickProductsForRitual } from "@/lib/rituals/pick-ritual-products";
import { getRitualBySlug, type Ritual, type RitualSlug } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

export const VESTIAIRE_CAPSULE_MIN = 3;
export const VESTIAIRE_CAPSULE_MAX = 6;
export const VESTIAIRE_LOW_STOCK_THRESHOLD = 3;

export type VestiaireMomentId =
  | "matin-ecole"
  | "nuit-douce"
  | "jour-de-pluie"
  | "bebe-cocon"
  | "petits-prix";

export type VestiaireAgeBand = CatalogueAgeBand | "8-12-ans";

export type VestiaireBudgetId = "petit-prix" | "equilibre" | "coup-de-coeur";

export interface VestiaireMomentOption {
  id: VestiaireMomentId;
  label: string;
  ritualSlug: RitualSlug;
}

export interface VestiaireAgeOption {
  id: VestiaireAgeBand;
  label: string;
  hint: string;
}

export interface VestiaireBudgetOption {
  id: VestiaireBudgetId;
  label: string;
  hint: string;
}

export interface VestiaireSelection {
  moment: VestiaireMomentId;
  age: VestiaireAgeBand;
  budget: VestiaireBudgetId;
}

export interface VestiaireRayonAlternative {
  label: string;
  href: string;
}

export interface VestiaireCapsuleResult {
  products: ProductListItem[];
  ritual: Ritual;
  selection: VestiaireSelection;
  totalCents: number;
  capsuleHref: string;
  alternatives: VestiaireRayonAlternative[];
}

export const VESTIAIRE_MOMENTS: readonly VestiaireMomentOption[] = [
  { id: "matin-ecole", label: "Matin école", ritualSlug: "matin-presse" },
  { id: "nuit-douce", label: "Nuit douce", ritualSlug: "nuit-calme" },
  { id: "jour-de-pluie", label: "Jour de pluie", ritualSlug: "jour-de-pluie" },
  { id: "bebe-cocon", label: "Bébé cocon", ritualSlug: "bebe-cocon" },
  { id: "petits-prix", label: "Petits prix", ritualSlug: "petit-budget" },
] as const;

export const VESTIAIRE_AGE_OPTIONS: readonly VestiaireAgeOption[] = [
  { id: "bebe", label: "Bébé", hint: "0–12 mois" },
  { id: "1-3-ans", label: "1–3 ans", hint: "Tout-petit" },
  { id: "4-8-ans", label: "4–8 ans", hint: "École" },
  { id: "8-12-ans", label: "8–12 ans", hint: "Grand" },
] as const;

export const VESTIAIRE_BUDGET_OPTIONS: readonly VestiaireBudgetOption[] = [
  { id: "petit-prix", label: "Petit prix", hint: "Essentiels malins" },
  { id: "equilibre", label: "Équilibre", hint: "Bon rapport qualité" },
  { id: "coup-de-coeur", label: "Coup de cœur", hint: "Pièces coup de pouce" },
] as const;

export const DEFAULT_VESTIAIRE_SELECTION: VestiaireSelection = {
  moment: "matin-ecole",
  age: "4-8-ans",
  budget: "equilibre",
};

function normalizeAgeToken(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function tokenMatchesVestiaireAge(token: string, band: VestiaireAgeBand): boolean {
  const combined = normalizeAgeToken(token);
  if (!combined) return false;

  if (band === "8-12-ans") {
    return /(9\s*ans|10\s*ans|11\s*ans|12\s*ans|8-12|9a|10a|11a|12a)/i.test(combined);
  }

  return variantMatchesAgeBand(token, token, band);
}

export function productMatchesVestiaireAge(
  product: ProductListItem,
  band: VestiaireAgeBand,
): boolean {
  if (band === "bebe" && product.categorySlug === "bebe") {
    return true;
  }

  const tokens = [...(product.sizes ?? []), ...(product.ageLabels ?? [])];
  if (tokens.some((token) => tokenMatchesVestiaireAge(token, band))) {
    return true;
  }

  return false;
}

function getMomentOption(moment: VestiaireMomentId): VestiaireMomentOption {
  return VESTIAIRE_MOMENTS.find((item) => item.id === moment) ?? VESTIAIRE_MOMENTS[0]!;
}

function ageBandToCatalogueAges(band: VestiaireAgeBand): string[] | undefined {
  switch (band) {
    case "bebe":
      return ["0-3 mois", "3-12 mois"];
    case "1-3-ans":
      return ["1-3 ans"];
    case "4-8-ans":
      return ["4-8 ans"];
    case "8-12-ans":
      return undefined;
  }
}

export function buildVestiaireCapsuleHref(
  ritual: Ritual,
  selection: VestiaireSelection,
): string {
  const ages = ageBandToCatalogueAges(selection.age);

  if (selection.budget === "petit-prix" || ritual.slug === "petit-budget") {
    return buildCatalogueHref({
      promo: "petit-prix",
      categorySlug: ritual.primaryCategorySlug,
      ...(ages ? { ages } : {}),
    });
  }

  if (ages?.length) {
    return buildCategoryHref(ritual.primaryCategorySlug, { ages });
  }

  return ritual.catalogueHref;
}

function applyBudgetRanking(
  products: ProductListItem[],
  budget: VestiaireBudgetId,
): ProductListItem[] {
  const sorted = [...products];

  switch (budget) {
    case "petit-prix": {
      const lowPrice = filterLowPriceProducts(sorted);
      const pool = lowPrice.length >= VESTIAIRE_CAPSULE_MIN ? lowPrice : sorted;
      return pool.sort((a, b) => a.minPriceCents - b.minPriceCents);
    }
    case "coup-de-coeur":
      return sorted.sort((a, b) => b.minPriceCents - a.minPriceCents);
    case "equilibre":
    default:
      return sorted.sort((a, b) => {
        const stockDiff = b.totalStock - a.totalStock;
        if (stockDiff !== 0) return stockDiff;
        return a.minPriceCents - b.minPriceCents;
      });
  }
}

export function buildVestiaireAlternatives(
  ritual: Ritual,
): VestiaireRayonAlternative[] {
  const fromRitual = ritual.emptyStateCtas.map((cta) => ({
    label: cta.label,
    href: cta.href,
  }));

  const rayons = HOME_RAYONS.filter((rayon) => rayon.id !== "petits-prix")
    .slice(0, 3)
    .map((rayon) => ({ label: rayon.label, href: rayon.href }));

  const merged = [...fromRitual, ...rayons];
  const seen = new Set<string>();

  return merged.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

export function estimateCapsuleTotalCents(products: ProductListItem[]): number {
  return products.reduce((sum, product) => sum + product.minPriceCents, 0);
}

export function pickVestiaireCapsule(
  allProducts: ProductListItem[],
  selection: VestiaireSelection = DEFAULT_VESTIAIRE_SELECTION,
): VestiaireCapsuleResult | null {
  const moment = getMomentOption(selection.moment);
  const ritual = getRitualBySlug(moment.ritualSlug);
  if (!ritual) return null;

  const ritualPool = pickProductsForRitual(allProducts, ritual);
  const ageFiltered = ritualPool.filter((product) =>
    productMatchesVestiaireAge(product, selection.age),
  );
  const pool = ageFiltered.length > 0 ? ageFiltered : ritualPool;
  const ranked = applyBudgetRanking(pool, selection.budget);
  const products = ranked.slice(0, VESTIAIRE_CAPSULE_MAX);

  return {
    products,
    ritual,
    selection,
    totalCents: estimateCapsuleTotalCents(products),
    capsuleHref: buildVestiaireCapsuleHref(ritual, selection),
    alternatives: buildVestiaireAlternatives(ritual),
  };
}

export function isVestiaireLowStock(totalStock: number): boolean {
  return totalStock > 0 && totalStock <= VESTIAIRE_LOW_STOCK_THRESHOLD;
}
