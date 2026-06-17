"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Tailles consultées sur les fiches produit — local, pas de cookie marketing. */
export const CONSULTED_SIZES_STORAGE_KEY = "tilouki-consulted-sizes";
export const MAX_CONSULTED_SIZES = 12;

export interface ConsultedSizeEntry {
  productSlug: string;
  productName: string;
  label: string;
  consultedAt: number;
}

interface ConsultedSizesState {
  entries: ConsultedSizeEntry[];
  track: (entry: Omit<ConsultedSizeEntry, "consultedAt">) => void;
  listEntries: () => ConsultedSizeEntry[];
  listUniqueLabels: () => string[];
  count: () => number;
}

function normalizeEntry(raw: unknown): ConsultedSizeEntry | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Partial<ConsultedSizeEntry>;
  const productSlug = record.productSlug?.trim();
  const label = record.label?.trim();
  if (!productSlug || !label) return null;

  const consultedAt =
    typeof record.consultedAt === "number" && Number.isFinite(record.consultedAt)
      ? record.consultedAt
      : 0;

  return {
    productSlug,
    productName: record.productName?.trim() || productSlug,
    label,
    consultedAt,
  };
}

function normalizeEntries(raw: unknown): ConsultedSizeEntry[] {
  if (!Array.isArray(raw)) return [];

  const entries: ConsultedSizeEntry[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const entry = normalizeEntry(item);
    if (!entry) continue;

    const key = `${entry.productSlug}:${entry.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push(entry);
  }

  return entries.slice(-MAX_CONSULTED_SIZES);
}

export const useConsultedSizesStore = create<ConsultedSizesState>()(
  persist(
    (set, get) => ({
      entries: [],

      track: (entry) => {
        const productSlug = entry.productSlug.trim();
        const label = entry.label.trim();
        if (!productSlug || !label) return;

        const without = get().entries.filter(
          (item) => !(item.productSlug === productSlug && item.label === label),
        );
        const next = [
          ...without,
          {
            productSlug,
            productName: entry.productName.trim() || productSlug,
            label,
            consultedAt: Date.now(),
          },
        ].slice(-MAX_CONSULTED_SIZES);

        set({ entries: next });
      },

      listEntries: () => [...get().entries],

      listUniqueLabels: () => {
        const labels: string[] = [];
        const seen = new Set<string>();

        for (let index = get().entries.length - 1; index >= 0; index -= 1) {
          const label = get().entries[index]!.label;
          if (seen.has(label)) continue;
          seen.add(label);
          labels.push(label);
        }

        return labels;
      },

      count: () => get().entries.length,
    }),
    {
      name: CONSULTED_SIZES_STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ entries: state.entries }),
      migrate: (persisted) => {
        const state = persisted as { entries?: unknown };
        return { entries: normalizeEntries(state.entries) };
      },
    },
  ),
);

export function resetConsultedSizesStore(entries: ConsultedSizeEntry[] = []) {
  useConsultedSizesStore.setState({ entries: normalizeEntries(entries) });
}
