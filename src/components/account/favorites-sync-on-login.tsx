"use client";

import { useEffect, useRef } from "react";

import { useFavoritesStore } from "@/lib/favorites/store";
import { syncCustomerFavoritesAction } from "@/server/actions/account/favorites-sync";

interface FavoritesSyncOnLoginProps {
  isAuthenticated: boolean;
}

/**
 * Après connexion magic link, fusionne favoris locaux et distants une fois par session.
 */
export function FavoritesSyncOnLogin({ isAuthenticated }: FavoritesSyncOnLoginProps) {
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || syncedRef.current) return;
    syncedRef.current = true;

    void (async () => {
      const localSlugs = useFavoritesStore.getState().slugs;
      const result = await syncCustomerFavoritesAction(localSlugs);
      if (result.slugs) {
        useFavoritesStore.setState({ slugs: result.slugs });
      }
    })();
  }, [isAuthenticated]);

  return null;
}
