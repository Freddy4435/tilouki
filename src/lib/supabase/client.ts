import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Client Supabase pour les composants client (auth admin, uploads futurs).
 * Utilise uniquement la clé anon — jamais le service role.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase non configuré. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
    );
  }

  return browserClient;
}
