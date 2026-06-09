import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getAdminSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient();
}
