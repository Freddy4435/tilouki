import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase lecture publique sans cookies.
 * À utiliser dans unstable_cache et autres contextes statiques.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase non configuré. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
