"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { recentSlugsFromEntries } from "@/lib/recently-viewed/slugs";

/** Historique local strictement fonctionnel — pas de cookie marketing ni sync serveur. */
export const RECENTLY_VIEWED_STORAGE_KEY = "tilouki-recently-viewed";
export const MAX_RECENTLY_VIEWED = 12;

interface RecentlyViewedEntry {
  slug: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  entries: RecentlyViewedEntry[];
  trackView: (slug: string) => void;
  listSlugs: () => string[];
  count: () => number;
}

function normalizeSlug(slug: string): string {
  return slug.trim();
}

function normalizeEntries(raw: unknown): RecentlyViewedEntry[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const entries: RecentlyViewedEntry[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as { slug?: unknown; viewedAt?: unknown };
    const slug = typeof record.slug === "string" ? normalizeSlug(record.slug) : "";
    if (!slug || seen.has(slug)) continue;

    const viewedAt =
      typeof record.viewedAt === "number" && Number.isFinite(record.viewedAt)
        ? record.viewedAt
        : 0;

    seen.add(slug);
    entries.push({ slug, viewedAt });
  }

  return entries.slice(-MAX_RECENTLY_VIEWED);
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      entries: [],

      trackView: (slug) => {
        const normalized = normalizeSlug(slug);
        if (!normalized) return;

        const without = get().entries.filter((entry) => entry.slug !== normalized);
        const next = [...without, { slug: normalized, viewedAt: Date.now() }].slice(
          -MAX_RECENTLY_VIEWED,
        );

        set({ entries: next });
      },

      listSlugs: () => recentSlugsFromEntries(get().entries),

      count: () => get().entries.length,
    }),
    {
      name: RECENTLY_VIEWED_STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ entries: state.entries }),
      migrate: (persisted) => {
        const state = persisted as { entries?: unknown };
        return { entries: normalizeEntries(state.entries) };
      },
    },
  ),
);

/** Réinitialise le store (tests). */
export function resetRecentlyViewedStore(entries: RecentlyViewedEntry[] = []) {
  useRecentlyViewedStore.setState({ entries: normalizeEntries(entries) });
}
