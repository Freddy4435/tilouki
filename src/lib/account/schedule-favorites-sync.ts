"use client";

import { syncCustomerFavoritesAction } from "@/server/actions/account/favorites-sync";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Pousse les favoris locaux vers le compte (debounce 600 ms). */
export function scheduleCustomerFavoritesSync(slugs: string[]): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void syncCustomerFavoritesAction(slugs);
  }, 600);
}
