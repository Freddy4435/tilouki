"use server";

import { syncCustomerFavorites } from "@/lib/account/customer-favorites-service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { customerFavoritesSyncSchema } from "@/lib/validations/account";

export async function syncCustomerFavoritesAction(slugs: string[]): Promise<{
  error?: string;
  slugs?: string[];
  synced?: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { error: "Synchronisation indisponible." };
  }

  const parsed = customerFavoritesSyncSchema.safeParse({ slugs });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Favoris invalides." };
  }

  try {
    const result = await syncCustomerFavorites(parsed.data.slugs);
    return { slugs: result.slugs, synced: result.synced };
  } catch {
    return { error: "Impossible de synchroniser vos favoris." };
  }
}
