"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/supabase/cache";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { slugify } from "@/lib/utils/slug";
import { requireAdmin } from "@/server/auth";

export async function saveCategoryAction(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? name));
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  const payload = { name, slug, description, sort_order: sortOrder, is_active: isActive };

  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);

  if (error) return { error: error.message };

  revalidateTag(CACHE_TAGS.categories, "max");
  revalidatePath("/admin/categories");
  return {};
}
