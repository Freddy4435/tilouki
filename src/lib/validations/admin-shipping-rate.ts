import { z } from "zod";

import { parseEuroToCents } from "@/lib/admin/euro-parse";
import type { ShippingServiceId } from "@/lib/shipping/types";

/** Tranche existante minimale pour la détection de chevauchement. */
export interface RateRange {
  id?: string;
  label: string;
  minWeightGrams: number;
  maxWeightGrams: number;
  isActive: boolean;
}

const eurosToCents = z.union([z.string(), z.number()]).transform((v, ctx) => {
  const cents = parseEuroToCents(v);
  if (cents === null) {
    ctx.addIssue({ code: "custom", message: "Prix invalide (montant en euros ≥ 0)." });
    return z.NEVER;
  }
  if (cents <= 0) {
    ctx.addIssue({ code: "custom", message: "Le prix doit être strictement positif." });
    return z.NEVER;
  }
  return cents;
});

export const SHIPPING_METHOD_IDS = [
  "relay_point",
] as const satisfies readonly ShippingServiceId[];

export const adminShippingRateSchema = z
  .object({
    id: z.string().uuid().optional(),
    provider: z.enum(["mondial_relay", "chronopost"]),
    shippingMethod: z.enum(SHIPPING_METHOD_IDS).default("relay_point"),
    label: z.string().trim().min(1, "Le libellé est requis.").max(100),
    minWeightGrams: z.coerce
      .number()
      .int("Poids minimum invalide.")
      .min(0, "Le poids minimum doit être ≥ 0."),
    maxWeightGrams: z.coerce
      .number()
      .int("Poids maximum invalide.")
      .positive("Le poids maximum doit être > 0."),
    priceCents: eurosToCents,
    sortOrder: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.minWeightGrams >= data.maxWeightGrams) {
      ctx.addIssue({
        code: "custom",
        message: "Le poids minimum doit être strictement inférieur au poids maximum.",
        path: ["minWeightGrams"],
      });
    }
  });

export type AdminShippingRateInput = z.infer<typeof adminShippingRateSchema>;

/**
 * Cherche une tranche active chevauchant la tranche candidate (même provider).
 * Les bornes sont inclusives : [0–250] et [250–500] se chevauchent sur 250 g,
 * le barème attendu est [0–250] puis [251–500].
 * Retourne la première tranche en conflit, ou null.
 */
export function findOverlappingRate(
  candidate: Pick<RateRange, "id" | "minWeightGrams" | "maxWeightGrams">,
  existing: RateRange[],
): RateRange | null {
  for (const rate of existing) {
    if (!rate.isActive) continue;
    if (candidate.id && rate.id === candidate.id) continue;
    const overlaps =
      candidate.minWeightGrams <= rate.maxWeightGrams &&
      rate.minWeightGrams <= candidate.maxWeightGrams;
    if (overlaps) return rate;
  }
  return null;
}

export type ReorderDirection = "up" | "down";

export interface SortableRate {
  id: string;
  sortOrder: number;
}

/**
 * Calcule les nouveaux sort_order après un déplacement haut/bas.
 * Retourne null si le déplacement est impossible (déjà en tête ou en queue).
 */
export function computeReorderUpdates(
  rates: SortableRate[],
  rateId: string,
  direction: ReorderDirection,
): Array<{ id: string; sortOrder: number }> | null {
  const sorted = [...rates].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sorted.findIndex((rate) => rate.id === rateId);
  if (index < 0) return null;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return null;

  const current = sorted[index]!;
  const neighbor = sorted[targetIndex]!;

  return [
    { id: current.id, sortOrder: neighbor.sortOrder },
    { id: neighbor.id, sortOrder: current.sortOrder },
  ];
}

/** Prochain ordre suggéré pour une nouvelle tranche. */
export function suggestNextSortOrder(rates: SortableRate[]): number {
  if (rates.length === 0) return 1;
  return Math.max(...rates.map((rate) => rate.sortOrder)) + 1;
}

/**
 * Fusionne une tranche candidate dans la liste existante (édition ou création).
 * Les tranches inactives sont exclues du résultat si la candidate est inactive.
 */
export function mergeRateIntoGrid(
  existing: RateRange[],
  candidate: RateRange & { id?: string },
): RateRange[] {
  const withoutSelf = candidate.id
    ? existing.filter((rate) => rate.id !== candidate.id)
    : existing;

  if (!candidate.isActive) return withoutSelf;

  return [
    ...withoutSelf,
    {
      id: candidate.id,
      label: candidate.label,
      minWeightGrams: candidate.minWeightGrams,
      maxWeightGrams: candidate.maxWeightGrams,
      isActive: true,
    },
  ];
}

/**
 * Vérifie qu'une grille de tranches actives est continue à partir de 0 g
 * (bornes adjacentes : max + 1 = min suivant). Retourne un message d'erreur ou null.
 */
export function validateContinuousRateGrid(rates: RateRange[]): string | null {
  const active = rates
    .filter((rate) => rate.isActive)
    .sort(
      (a, b) =>
        a.minWeightGrams - b.minWeightGrams || a.maxWeightGrams - b.maxWeightGrams,
    );

  if (active.length === 0) return null;

  if (active[0]!.minWeightGrams !== 0) {
    return "La grille active doit commencer à 0 g.";
  }

  for (let index = 1; index < active.length; index += 1) {
    const previous = active[index - 1]!;
    const current = active[index]!;
    const expectedMin = previous.maxWeightGrams + 1;

    if (current.minWeightGrams > expectedMin) {
      return `Trou dans la grille entre ${previous.maxWeightGrams} g et ${current.minWeightGrams} g (la tranche suivante doit commencer à ${expectedMin} g).`;
    }
  }

  return null;
}
