import "server-only";

import type { AdminDashboardAlertContext } from "@/lib/admin/dashboard-alerts";
import { loadAdminLegalComplianceInput } from "@/lib/admin/legal-compliance-context.server";
import { countActiveDevSeedProducts } from "@/lib/catalog/dev-seed-guard";
import { getEmailConfig } from "@/lib/email/config";
import {
  isChronopostConfigured,
  isDevMockShippingEnabled,
  isMondialRelayApiConfigured,
} from "@/lib/shipping/env";
import {
  isStripePublishableConfigured,
  isStripeServerConfigured,
} from "@/lib/stripe/env";
import { isProductImagesStorageConfigured } from "@/lib/supabase/storage-admin";
import type { AdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import type { AdminDashboardStats } from "@/lib/supabase/queries/admin/dashboard";

export async function buildAdminDashboardAlertContext(
  settings: AdminShopSettings | null,
  stats: AdminDashboardStats,
): Promise<AdminDashboardAlertContext> {
  const [storageConfigured, activeDevSeedProductCount, legalSettings] =
    await Promise.all([
      isProductImagesStorageConfigured(),
      countActiveDevSeedProducts().catch(() => 0),
      loadAdminLegalComplianceInput(settings),
    ]);

  return {
    legalSettings,
    activeProductCount: stats.activeProductCount,
    productsWithoutPhotoCount: stats.productsWithoutPhotoCount,
    productsWithoutStockCount: stats.productsWithoutStockCount,
    productsWithoutWeightCount: stats.productsWithoutWeightCount,
    storageConfigured,
    stripeConfigured: isStripeServerConfigured() && isStripePublishableConfigured(),
    adminEmailConfigured: Boolean(getEmailConfig().adminEmail),
    transactionEmailConfigured: getEmailConfig().provider !== "none",
    mondialRelayConfigured: isMondialRelayApiConfigured(),
    chronopostConfigured: isChronopostConfigured(),
    devMockShipping: isDevMockShippingEnabled(),
    activeDevSeedProductCount,
  };
}
