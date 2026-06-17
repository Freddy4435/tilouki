import "server-only";

import { mergeFavoriteSlugs } from "@/lib/account/favorites-merge";
import { MAX_FAVORITES } from "@/lib/favorites/store";
import { createClient } from "@/lib/supabase/server";

function normalizeSlugs(slugs: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of slugs) {
    const slug = raw.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    normalized.push(slug);
  }

  return normalized.slice(-MAX_FAVORITES);
}

export async function getCustomerAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function fetchCustomerFavoriteSlugs(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_favorites")
    .select("slugs")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.slugs) return [];
  return normalizeSlugs(data.slugs);
}

export async function upsertCustomerFavoriteSlugs(
  userId: string,
  slugs: string[],
): Promise<string[]> {
  const normalized = normalizeSlugs(slugs);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_favorites")
    .upsert({ user_id: userId, slugs: normalized }, { onConflict: "user_id" })
    .select("slugs")
    .single();

  if (error || !data?.slugs) {
    throw new Error("Impossible d'enregistrer vos favoris.");
  }

  return normalizeSlugs(data.slugs);
}

/** Fusionne favoris locaux et distants, puis persiste côté serveur. */
export async function syncCustomerFavorites(localSlugs: string[]): Promise<{
  slugs: string[];
  synced: boolean;
}> {
  const user = await getCustomerAuthUser();
  if (!user) {
    return { slugs: normalizeSlugs(localSlugs), synced: false };
  }

  const remote = await fetchCustomerFavoriteSlugs(user.id);
  const merged = mergeFavoriteSlugs(localSlugs, remote);
  const saved = await upsertCustomerFavoriteSlugs(user.id, merged);
  return { slugs: saved, synced: true };
}
