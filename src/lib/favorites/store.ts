"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Favoris locaux strictement fonctionnels — pas de cookie marketing ni sync serveur. */
export const FAVORITES_STORAGE_KEY = "tilouki-favorites";
export const MAX_FAVORITES = 50;

interface FavoritesState {
  slugs: string[];
  toggle: (slug: string) => boolean;
  has: (slug: string) => boolean;
  list: () => string[];
  count: () => number;
}

function normalizeSlug(slug: string): string {
  return slug.trim();
}

function normalizeSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const slugs: string[] = [];

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const slug = normalizeSlug(item);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
  }

  return slugs.slice(-MAX_FAVORITES);
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      slugs: [],

      toggle: (slug) => {
        const normalized = normalizeSlug(slug);
        if (!normalized) return false;

        const current = get().slugs;
        const exists = current.includes(normalized);
        const next = exists
          ? current.filter((item) => item !== normalized)
          : [...current, normalized].slice(-MAX_FAVORITES);

        set({ slugs: next });
        return !exists;
      },

      has: (slug) => {
        const normalized = normalizeSlug(slug);
        if (!normalized) return false;
        return get().slugs.includes(normalized);
      },

      list: () => [...get().slugs],

      count: () => get().slugs.length,
    }),
    {
      name: FAVORITES_STORAGE_KEY,
      version: 2,
      partialize: (state) => ({ slugs: state.slugs }),
      migrate: (persisted) => {
        const state = persisted as { slugs?: unknown };
        return { slugs: normalizeSlugs(state.slugs) };
      },
    },
  ),
);

/** Réinitialise le store (tests). */
export function resetFavoritesStore(slugs: string[] = []) {
  useFavoritesStore.setState({ slugs });
}
