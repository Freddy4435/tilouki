import "server-only";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("categories")
    .select("*, products:products(count)")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    productCount: (row.products as { count: number }[])?.[0]?.count ?? 0,
  }));
}
