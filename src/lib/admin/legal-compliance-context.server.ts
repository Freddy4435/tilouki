import "server-only";

import { buildLegalComplianceInput } from "@/lib/admin/legal-compliance-input";
import { listAdminLegalPages } from "@/lib/supabase/queries/admin/legal";
import { listAdminShippingRatesForProvider } from "@/lib/supabase/queries/admin/shipping-rates";
import type { AdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import type { LegalComplianceInput } from "@/lib/legal/compliance";

/** Charge paramètres boutique + pages légales + barème livraison pour l'admin. */
export async function loadAdminLegalComplianceInput(
  settings: AdminShopSettings | null,
): Promise<LegalComplianceInput | null> {
  if (!settings) return null;

  const [pages, mondialRelayRates] = await Promise.all([
    listAdminLegalPages(),
    listAdminShippingRatesForProvider("mondial_relay"),
  ]);

  return buildLegalComplianceInput(settings, {
    legalPages: pages.map((page) => ({
      slug: page.slug,
      content: page.content,
    })),
    activeShippingRateCount: mondialRelayRates.filter((rate) => rate.isActive).length,
  });
}
