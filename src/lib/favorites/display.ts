export function formatFavoritesCount(count: number): string | null {
  if (count <= 0) return null;
  return count > 9 ? "9+" : String(count);
}

export function buildFavoritesAriaLabel(count: number): string {
  if (count <= 0) return "Voir mes favoris";
  return `Voir mes favoris, ${count} article${count > 1 ? "s" : ""}`;
}
