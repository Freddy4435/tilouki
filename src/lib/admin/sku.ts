import { slugify } from "@/lib/utils/slug";

export function generateVariantSku(productSlug: string, existingSkus: string[]): string {
  const base = slugify(productSlug).slice(0, 40) || "produit";
  let index = existingSkus.length + 1;
  let candidate = `${base}-${String(index).padStart(3, "0")}`;
  const taken = new Set(existingSkus.map((s) => s.toLowerCase()));

  while (taken.has(candidate.toLowerCase())) {
    index += 1;
    candidate = `${base}-${String(index).padStart(3, "0")}`;
  }

  return candidate;
}
