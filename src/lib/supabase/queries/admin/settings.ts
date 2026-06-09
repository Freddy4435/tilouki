import "server-only";

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
  mediationUrl: string | null;
  repIdu: string | null;
  hostName: string | null;
  hostAddress: string | null;
  hostPhone: string | null;
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
  return {
    id: row.id,
    shopName: row.shop_name,
    legalName: row.legal_name,
    legalStatus: row.legal_status,
    siret: row.siret,
    address: row.address,
    email: row.email,
    phone: row.phone,
    vatEnabled: row.vat_enabled,
    vatRate: Number(row.vat_rate),
    vatNotice: row.vat_notice,
    currency: row.currency,
    mediationUrl: row.mediation_url,
    repIdu: row.rep_idu,
    hostName: row.host_name,
    hostAddress: row.host_address,
    hostPhone: row.host_phone,
  };
}
