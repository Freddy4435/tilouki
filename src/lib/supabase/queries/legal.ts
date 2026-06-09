import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS, REVALIDATE, legalTag } from "@/lib/supabase/cache";
import { SupabaseDataError } from "@/lib/supabase/errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { LegalPage } from "@/types/catalog";

async function fetchLegalPage(slug: string): Promise<LegalPage | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new SupabaseDataError(`getLegalPage(${slug})`, error);
  }

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    content: data.content,
    updatedAt: data.updated_at,
  };
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  return unstable_cache(() => fetchLegalPage(slug), ["legal-page", slug], {
    tags: [CACHE_TAGS.legal, legalTag(slug)],
    revalidate: REVALIDATE.legal,
  })();
}
