/** Slugs récents (plus récent en premier). */

export function recentSlugsFromEntries(
  entries: ReadonlyArray<{ slug: string }>,
): string[] {
  return [...entries].reverse().map((entry) => entry.slug);
}

/** Clé stable pour sélecteurs Zustand (évite les boucles useSyncExternalStore). */
export function entriesToSlugKey(entries: ReadonlyArray<{ slug: string }>): string {
  return recentSlugsFromEntries(entries).join("\0");
}
