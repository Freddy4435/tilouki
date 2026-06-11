import "server-only";

import type { AdminDashboardAlertContext } from "@/lib/admin/dashboard-alerts";
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
  const storageConfigured = await isProductImagesStorageConfigured();

  return {
    legalSettings: settings,
    activeProductCount: stats.activeProductCount,
    productsWithoutPhotoCount: stats.productsWithoutPhotoCount,
    productsWithoutStockCount: stats.productsWithoutStockCount,
    productsWithoutWeightCount: stats.productsWithoutWeightCount,
    storageConfigured,
    stripeConfigured: isStripeServerConfigured() && isStripePublishableConfigured(),
    adminEmailConfigured: Boolean(getEmailConfig().adminEmail),
    mondialRelayConfigured: isMondialRelayApiConfigured(),
    chronopostConfigured: isChronopostConfigured(),
    devMockShipping: isDevMockShippingEnabled(),
  };
}
