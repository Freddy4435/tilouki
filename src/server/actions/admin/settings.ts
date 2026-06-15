"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  getLegalComplianceSummary,
  type LegalComplianceInput,
} from "@/lib/legal/compliance";
import { parseShopAnnouncementsJson } from "@/lib/announcements/validation";
import { parseEditorialBlocksJson } from "@/lib/editorial/validation";
import { parseShopSocialLinksJson } from "@/lib/social/validation";
import { CACHE_TAGS } from "@/lib/supabase/cache";
import { SHOP_SETTINGS_SINGLETON_ID } from "@/lib/supabase/env";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { requireAdmin } from "@/server/auth";
import type { Json } from "@/types/database";

function validateProductionLegalFields(payload: LegalComplianceInput): string | null {
  if (process.env.NODE_ENV !== "production") return null;

  const summary = getLegalComplianceSummary(payload, { includeInfrastructure: false });
  if (summary.isComplete) return null;

  const labels = summary.missingRequired.map((item) => item.label).join(", ");
  return `En production, complétez les champs obligatoires avant enregistrement : ${labels}.`;
}

export async function updateShopSettingsAction(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const id = String(formData.get("id") ?? "");
  const announcementsRaw = formData.get("announcements");
  const announcementsParsed = parseShopAnnouncementsJson(announcementsRaw);
  if (!announcementsParsed.ok) {
    return { error: announcementsParsed.error };
  }

  const socialLinksParsed = parseShopSocialLinksJson(formData.get("socialLinks"));
  if (!socialLinksParsed.ok) {
    return { error: socialLinksParsed.error };
  }

  const editorialParsed = parseEditorialBlocksJson(formData.get("editorialBlocks"));
  if (!editorialParsed.ok) {
    return { error: editorialParsed.error };
  }

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
    mediation_name: String(formData.get("mediationName") ?? "").trim() || null,
    mediation_url: String(formData.get("mediationUrl") ?? "").trim() || null,
    rep_idu: String(formData.get("repIdu") ?? "").trim() || null,
    host_name: String(formData.get("hostName") ?? "").trim() || null,
    host_address: String(formData.get("hostAddress") ?? "").trim() || null,
    host_phone: String(formData.get("hostPhone") ?? "").trim() || null,
    host_email: String(formData.get("hostEmail") ?? "").trim() || null,
    return_policy: String(formData.get("returnPolicy") ?? "").trim() || null,
    exchange_policy: String(formData.get("exchangePolicy") ?? "").trim() || null,
    analytics_enabled: formData.get("analyticsEnabled") === "on",
    announcements_enabled: formData.get("announcementsEnabled") === "on",
    announcements: announcementsParsed.data as unknown as Json,
    social_links: socialLinksParsed.data as unknown as Json,
    editorial_blocks: editorialParsed.data as unknown as Json,
  };

  const legalValidationError = validateProductionLegalFields({
    shopName: payload.shop_name,
    legalName: payload.legal_name,
    legalStatus: payload.legal_status,
    siret: payload.siret,
    address: payload.address,
    email: payload.email,
    phone: payload.phone,
    vatEnabled: payload.vat_enabled,
    vatNotice: payload.vat_notice,
    mediationName: payload.mediation_name,
    mediationUrl: payload.mediation_url,
    repIdu: payload.rep_idu,
    hostName: payload.host_name,
    hostAddress: payload.host_address,
    hostPhone: payload.host_phone,
    hostEmail: payload.host_email,
    returnPolicy: payload.return_policy,
    exchangePolicy: payload.exchange_policy,
  });

  if (legalValidationError) {
    return { error: legalValidationError };
  }

  const { error } = await supabase.from("shop_settings").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidateTag(CACHE_TAGS.shopSettings, "max");
  revalidateTag(CACHE_TAGS.legal, "max");
  revalidatePath("/admin/parametres");
  revalidatePath("/admin/preparation");
  revalidatePath("/");
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

/** Met à jour ou supprime l'image hero (URL publique Storage). */
export async function updateShopHeroImageAction(
  heroImageUrl: string | null,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const { error } = await supabase
    .from("shop_settings")
    .update({ hero_image_url: heroImageUrl })
    .eq("id", SHOP_SETTINGS_SINGLETON_ID);

  if (error) return { error: error.message };

  revalidateTag(CACHE_TAGS.shopSettings, "max");
  revalidatePath("/admin/parametres");
  revalidatePath("/");
  return {};
}
