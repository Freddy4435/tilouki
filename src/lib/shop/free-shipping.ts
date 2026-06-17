/** Seuil livraison offerte (centimes TTC panier). Configurable via env. */
const DEFAULT_FREE_SHIPPING_THRESHOLD_CENTS = 8_000;

export function resolveFreeShippingThresholdCents(): number | null {
  const raw = process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS?.trim();
  if (raw === "0" || raw?.toLowerCase() === "off") return null;
  if (!raw) return DEFAULT_FREE_SHIPPING_THRESHOLD_CENTS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_FREE_SHIPPING_THRESHOLD_CENTS;
  }
  return parsed;
}

export interface FreeShippingProgress {
  thresholdCents: number;
  subtotalCents: number;
  remainingCents: number;
  progressPercent: number;
  qualified: boolean;
}

export function computeFreeShippingProgress(
  subtotalCents: number,
  thresholdCents: number,
): FreeShippingProgress {
  const safeSubtotal = Math.max(0, subtotalCents);
  const safeThreshold = Math.max(1, thresholdCents);
  const remainingCents = Math.max(0, safeThreshold - safeSubtotal);
  const progressPercent = Math.min(
    100,
    Math.round((safeSubtotal / safeThreshold) * 100),
  );

  return {
    thresholdCents: safeThreshold,
    subtotalCents: safeSubtotal,
    remainingCents,
    progressPercent,
    qualified: safeSubtotal >= safeThreshold,
  };
}
