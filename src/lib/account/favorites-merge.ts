import { MAX_FAVORITES } from "@/lib/favorites/store";

/** Fusionne favoris locaux et distants (union, ordre local d'abord). */
export function mergeFavoriteSlugs(local: string[], remote: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const slug of [...local, ...remote]) {
    const normalized = slug.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(normalized);
  }

  return merged.slice(-MAX_FAVORITES);
}
