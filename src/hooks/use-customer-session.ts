"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Session client Supabase (compte magic link — distinct de l'admin). */
export function useCustomerSession(): boolean {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  return authenticated;
}
