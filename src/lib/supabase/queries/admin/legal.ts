import "server-only";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";

export interface AdminLegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export async function listAdminLegalPages(): Promise<AdminLegalPage[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("legal_pages")
    .select("id, slug, title, content, updated_at")
    .order("slug", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at,
  }));
}

export async function getAdminLegalPage(slug: string): Promise<AdminLegalPage | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("legal_pages")
    .select("id, slug, title, content, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    content: data.content,
    updatedAt: data.updated_at,
  };
}
