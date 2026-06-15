import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Client Supabase service role — SERVEUR UNIQUEMENT.
 * Contourne RLS pour checkout, webhooks Stripe et opérations admin batch.
 * Ne jamais importer dans un composant "use client".
 */
export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error(
      "Supabase admin non configuré. Définissez SUPABASE_SERVICE_ROLE_KEY côté serveur.",
    );
  }

  if (!adminClient) {
    adminClient = createClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}
