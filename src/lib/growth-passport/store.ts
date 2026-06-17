"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const GROWTH_PASSPORT_STORAGE_KEY = "tilouki-growth-passport";
export const MAX_GROWTH_PROFILES = 3;

export interface GrowthProfile {
  id: string;
  name: string;
  /** Taille actuelle repérée (ex. « 4 ans », « 6 mois »). */
  sizeLabel: string;
  /** Mois de naissance optionnel (1–12) pour rappel futur. */
  birthMonth?: number | null;
  /** Année de naissance optionnelle. */
  birthYear?: number | null;
}

interface GrowthPassportState {
  profiles: GrowthProfile[];
  activeProfileId: string | null;
  upsertProfile: (profile: Omit<GrowthProfile, "id"> & { id?: string }) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  activeProfile: () => GrowthProfile | null;
}

function normalizeProfiles(raw: unknown): GrowthProfile[] {
  if (!Array.isArray(raw)) return [];
  const profiles: GrowthProfile[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Partial<GrowthProfile>;
    const name = record.name?.trim();
    const sizeLabel = record.sizeLabel?.trim();
    if (!name || !sizeLabel) continue;
    profiles.push({
      id: record.id?.trim() || crypto.randomUUID(),
      name,
      sizeLabel,
      birthMonth: record.birthMonth ?? null,
      birthYear: record.birthYear ?? null,
    });
  }

  return profiles.slice(0, MAX_GROWTH_PROFILES);
}

export const useGrowthPassportStore = create<GrowthPassportState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      upsertProfile: (profile) => {
        const id = profile.id?.trim() || crypto.randomUUID();
        set((state) => {
          const existingIndex = state.profiles.findIndex((item) => item.id === id);
          const nextProfile: GrowthProfile = {
            id,
            name: profile.name.trim(),
            sizeLabel: profile.sizeLabel.trim(),
            birthMonth: profile.birthMonth ?? null,
            birthYear: profile.birthYear ?? null,
          };

          const profiles =
            existingIndex >= 0
              ? state.profiles.map((item, index) =>
                  index === existingIndex ? nextProfile : item,
                )
              : [...state.profiles, nextProfile].slice(-MAX_GROWTH_PROFILES);

          return {
            profiles,
            activeProfileId: id,
          };
        });
      },
      removeProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((item) => item.id !== id),
          activeProfileId:
            state.activeProfileId === id
              ? (state.profiles.find((item) => item.id !== id)?.id ?? null)
              : state.activeProfileId,
        }));
      },
      setActiveProfile: (id) => set({ activeProfileId: id }),
      activeProfile: () => {
        const { profiles, activeProfileId } = get();
        if (!activeProfileId) return profiles[0] ?? null;
        return profiles.find((item) => item.id === activeProfileId) ?? profiles[0] ?? null;
      },
    }),
    {
      name: GROWTH_PASSPORT_STORAGE_KEY,
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<GrowthPassportState> | undefined;
        const profiles = normalizeProfiles(stored?.profiles);
        const activeProfileId =
          stored?.activeProfileId &&
          profiles.some((item) => item.id === stored.activeProfileId)
            ? stored.activeProfileId
            : (profiles[0]?.id ?? null);
        return { ...current, profiles, activeProfileId };
      },
    },
  ),
);

/** Taille active du passeport pour pré-sélection catalogue / PDP. */
export function resolvePassportSizeLabel(): string | null {
  if (typeof window === "undefined") return null;
  return useGrowthPassportStore.getState().activeProfile()?.sizeLabel ?? null;
}
