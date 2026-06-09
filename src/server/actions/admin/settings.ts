"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/supabase/cache";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { requireAdmin } from "@/server/auth";

export async function updateShopSettingsAction(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const id = String(formData.get("id") ?? "");
  const payload = {
    shop_name: String(formData.get("shopName") ?? "").trim(),
    legal_name: String(formData.get("legalName") ?? "").trim() || null,
    legal_status: String(formData.get("legalStatus") ?? "").trim() || null,
    siret: String(formData.get("siret") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    vat_enabled: formData.get("vatEnabled") === "on",
    vat_notice: String(formData.get("vatNotice") ?? "").trim() || null,
    mediation_url: String(formData.get("mediationUrl") ?? "").trim() || null,
    rep_idu: String(formData.get("repIdu") ?? "").trim() || null,
    host_name: String(formData.get("hostName") ?? "").trim() || null,
    host_address: String(formData.get("hostAddress") ?? "").trim() || null,
    host_phone: String(formData.get("hostPhone") ?? "").trim() || null,
  };

  const { error } = await supabase.from("shop_settings").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidateTag(CACHE_TAGS.shopSettings, "max");
  revalidateTag(CACHE_TAGS.legal, "max");
  revalidatePath("/admin/parametres");
  for (const path of [
    "/mentions-legales",
    "/cgv",
    "/confidentialite",
    "/cookies",
    "/livraison-retours",
    "/formulaire-retractation",
  ]) {
    revalidatePath(path);
  }
  return {};
}
