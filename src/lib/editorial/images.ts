/** Image exploitable en vitrine (pas de SVG catalogue ni visuel démo). */
export function isRealEditorialImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg")) return false;
  if (lower.includes("/demo-products/")) return false;
  return true;
}
