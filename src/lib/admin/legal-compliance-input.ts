import type { LegalComplianceInput } from "@/lib/legal/compliance";
import type { AdminShopSettings } from "@/lib/supabase/queries/admin/settings";

export function buildLegalComplianceInput(
  settings: AdminShopSettings | null,
  options?: {
    legalPages?: Array<{ slug: string; content: string }>;
    activeShippingRateCount?: number;
  },
): LegalComplianceInput | null {
  if (!settings) return null;

  return {
    shopName: settings.shopName,
    legalName: settings.persistedSellerIdentity.legalName,
    legalStatus: settings.persistedSellerIdentity.legalStatus,
    siret: settings.persistedSellerIdentity.siret,
    address: settings.persistedSellerIdentity.address,
    email: settings.email,
    phone: settings.phone,
    vatEnabled: settings.vatEnabled,
    vatNotice: settings.vatNotice,
    mediationName: settings.mediationName,
    mediationUrl: settings.mediationUrl,
    repIdu: settings.repIdu,
    hostName: settings.hostName,
    hostAddress: settings.hostAddress,
    hostPhone: settings.hostPhone,
    hostEmail: settings.hostEmail,
    returnPolicy: settings.returnPolicy,
    exchangePolicy: settings.exchangePolicy,
    analyticsEnabled: settings.analyticsEnabled,
    legalPages: options?.legalPages,
    activeShippingRateCount: options?.activeShippingRateCount,
  };
}
