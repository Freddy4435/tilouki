import "server-only";

import type { ShopAnnouncement } from "@/lib/announcements/types";
import type { EditorialBlock } from "@/lib/editorial/types";
import { normalizeShopAnnouncements } from "@/lib/announcements/validation";
import { normalizeEditorialBlocks } from "@/lib/editorial/validation";
import type {
  SellerIdentityFieldKey,
  SellerIdentityFields,
} from "@/lib/legal/verified-seller-identity";
import { withVerifiedSellerIdentityDefaults } from "@/lib/legal/verified-seller-identity";
import type { ShopSocialLinksInput } from "@/lib/social/validation";
import { normalizeShopSocialLinks } from "@/lib/social/validation";
import { SHOP_SETTINGS_SINGLETON_ID } from "@/lib/supabase/env";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import type { Database } from "@/types/database";

type ShopSettingsRow = Database["public"]["Tables"]["shop_settings"]["Row"];

export interface AdminShopSettings {
  id: string;
  shopName: string;
  legalName: string | null;
  legalStatus: string | null;
  siret: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  vatEnabled: boolean;
  vatRate: number;
  vatNotice: string | null;
  currency: string;
  mediationName: string | null;
  mediationUrl: string | null;
  repIdu: string | null;
  hostName: string | null;
  hostAddress: string | null;
  hostPhone: string | null;
  hostEmail: string | null;
  returnPolicy: string | null;
  exchangePolicy: string | null;
  analyticsEnabled: boolean;
  heroImageUrl: string | null;
  announcementsEnabled: boolean;
  announcements: ShopAnnouncement[];
  socialLinks: ShopSocialLinksInput;
  editorialBlocks: EditorialBlock[];
  /** Valeurs identité telles qu'en base (hors préremplissage formulaire). */
  persistedSellerIdentity: SellerIdentityFields;
  /** Champs identité préremplis depuis le SIRET vérifié (pas encore en base). */
  suggestedSellerIdentityFields: SellerIdentityFieldKey[];
}

export async function getAdminShopSettings(): Promise<AdminShopSettings | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("shop_settings")
    .select("*")
    .eq("id", SHOP_SETTINGS_SINGLETON_ID)
    .maybeSingle();

  if (!data) {
    const { data: fallback } = await supabase
      .from("shop_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!fallback) return null;
    return mapSettings(fallback);
  }

  return mapSettings(data);
}

function mapSettings(row: ShopSettingsRow): AdminShopSettings {
  const persistedSellerIdentity: SellerIdentityFields = {
    legalName: row.legal_name,
    legalStatus: row.legal_status,
    siret: row.siret,
    address: row.address,
  };
  const { values, suggestedFields } = withVerifiedSellerIdentityDefaults(
    persistedSellerIdentity,
  );

  return {
    id: row.id,
    shopName: row.shop_name,
    legalName: values.legalName ?? null,
    legalStatus: values.legalStatus ?? null,
    siret: values.siret ?? null,
    address: values.address ?? null,
    email: row.email,
    phone: row.phone,
    vatEnabled: row.vat_enabled,
    vatRate: Number(row.vat_rate),
    vatNotice: row.vat_notice,
    currency: row.currency,
    mediationName: row.mediation_name,
    mediationUrl: row.mediation_url,
    repIdu: row.rep_idu,
    hostName: row.host_name,
    hostAddress: row.host_address,
    hostPhone: row.host_phone,
    hostEmail: row.host_email,
    returnPolicy: row.return_policy,
    exchangePolicy: row.exchange_policy,
    analyticsEnabled: row.analytics_enabled ?? false,
    heroImageUrl: row.hero_image_url,
    announcementsEnabled: row.announcements_enabled ?? false,
    announcements: normalizeShopAnnouncements(row.announcements),
    socialLinks: normalizeShopSocialLinks(row.social_links),
    editorialBlocks: normalizeEditorialBlocks(row.editorial_blocks),
    persistedSellerIdentity,
    suggestedSellerIdentityFields: suggestedFields,
  };
}
