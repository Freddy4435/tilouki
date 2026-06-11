/** Convertit un montant en euros (virgule ou point) en centimes. */

export function parseEuroToCents(value: string | number | null | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim().replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
