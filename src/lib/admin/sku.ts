import { slugify } from "@/lib/utils/slug";

export interface VariantSkuHints {
  sizeLabel?: string | null;
  ageLabel?: string | null;
  color?: string | null;
}

function hintSlug(value: string | null | undefined, max = 12): string {
  if (!value?.trim()) return "";
  return slugify(value).slice(0, max);
}

export function generateVariantSku(
  productSlug: string,
  existingSkus: string[],
  hints?: VariantSkuHints,
): string {
  const base = slugify(productSlug).slice(0, 28) || "produit";
  const suffixParts = [
    hintSlug(hints?.ageLabel),
    hintSlug(hints?.sizeLabel),
    hintSlug(hints?.color, 10),
  ].filter(Boolean);

  const suffix = suffixParts.length > 0 ? `-${suffixParts.join("-")}` : "";
  const taken = new Set(existingSkus.map((s) => s.toLowerCase()));

  let candidate = `${base}${suffix}`.slice(0, 80);
  if (!taken.has(candidate.toLowerCase())) {
    return candidate;
  }

  let index = existingSkus.length + 1;
  candidate = `${base}${suffix}-${String(index).padStart(2, "0")}`.slice(0, 80);
  while (taken.has(candidate.toLowerCase())) {
    index += 1;
    candidate = `${base}${suffix}-${String(index).padStart(2, "0")}`.slice(0, 80);
  }

  return candidate;
}
