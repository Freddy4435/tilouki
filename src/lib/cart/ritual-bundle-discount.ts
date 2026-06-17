const DEFAULT_MIN_ITEMS = 4;
const DEFAULT_DISCOUNT_PERCENT = 5;

export interface RitualBundleDiscountResult {
  applied: boolean;
  discountCents: number;
  minItems: number;
  percent: number;
  label: string;
}

export function resolveRitualBundleMinItems(): number {
  const raw = process.env.RITUAL_BUNDLE_MIN_ITEMS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MIN_ITEMS;
  if (!Number.isFinite(parsed) || parsed < 2) return DEFAULT_MIN_ITEMS;
  return parsed;
}

export function resolveRitualBundleDiscountPercent(): number {
  const raw = process.env.RITUAL_BUNDLE_DISCOUNT_PERCENT?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_DISCOUNT_PERCENT;
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 30) {
    return DEFAULT_DISCOUNT_PERCENT;
  }
  return parsed;
}

/**
 * Remise « tenue Tilouki » : −X % dès N articles distincts au panier.
 * Calcul serveur uniquement — jamais depuis le client.
 */
export function computeRitualBundleDiscount(
  subtotalCents: number,
  distinctLineCount: number,
): RitualBundleDiscountResult {
  const minItems = resolveRitualBundleMinItems();
  const percent = resolveRitualBundleDiscountPercent();

  if (subtotalCents <= 0 || distinctLineCount < minItems) {
    return {
      applied: false,
      discountCents: 0,
      minItems,
      percent,
      label: "",
    };
  }

  const discountCents = Math.min(
    subtotalCents - 1,
    Math.floor((subtotalCents * percent) / 100),
  );

  return {
    applied: discountCents > 0,
    discountCents,
    minItems,
    percent,
    label: `Remise tenue Tilouki −${percent} %`,
  };
}

export function previewRitualBundleDiscount(
  subtotalCents: number,
  distinctLineCount: number,
): RitualBundleDiscountResult {
  return computeRitualBundleDiscount(subtotalCents, distinctLineCount);
}
