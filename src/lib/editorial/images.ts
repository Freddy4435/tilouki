/** Image exploitable en vitrine (pas de SVG catalogue ni visuel démo / pack éditorial). */
export function isRealEditorialImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg")) return false;
  if (lower.includes("/demo-products/")) return false;
  if (lower.startsWith("/editorial/")) return false;
  if (lower.startsWith("/images/tilouki/")) return false;
  return true;
}
