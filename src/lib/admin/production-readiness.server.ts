import "server-only";

import {
  buildProductionReadinessSummary,
  countActiveRealProducts,
  type ProductionReadinessInput,
  type ProductionReadinessSummary,
} from "@/lib/admin/production-readiness";
import { countActiveDevSeedProducts } from "@/lib/catalog/dev-seed-guard";
import { runProductionDeployReadiness } from "@/lib/deploy/production-deploy-readiness.server";
import {
  getLegalPublicationMissingLabels,
  isLegalPublicationReady,
  renderSafePublicLegalHtml,
} from "@/lib/legal/publication";
import { LEGAL_PAGE_LABELS, LEGAL_PAGE_SLUGS } from "@/lib/legal/templates";
import { buildStorefrontNavigation } from "@/lib/navigation/build-storefront-nav";
import type { ShopSettings } from "@/lib/shop/types";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import { listAdminLegalPages } from "@/lib/supabase/queries/admin/legal";
import { listAdminShippingRatesForProvider } from "@/lib/supabase/queries/admin/shipping-rates";
import type { AdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import { getAdminShopSettings } from "@/lib/supabase/queries/admin/settings";
import { countPendingReviews } from "@/lib/supabase/queries/reviews";

function adminSettingsToShopSettings(settings: AdminShopSettings): ShopSettings {
  return {
    name: settings.shopName,
    tagline: "",
    description: "",
    legalName: settings.legalName,
    legalStatus: settings.legalStatus,
    siret: settings.siret,
    address: settings.address,
    phone: settings.phone,
    contactEmail: settings.email ?? "",
    contactEmailConfigured: Boolean(settings.email?.trim()),
    vatEnabled: settings.vatEnabled,
    vatRate: settings.vatRate,
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
    primaryColor: "",
    minShippingCents: 0,
    categories: [],
    navigation: buildStorefrontNavigation([], []),
  };
}

function evaluateCheckoutLegalPagesReadiness(
  pages: Array<{ slug: string; content: string }>,
  settings: ShopSettings | null,
): { ready: boolean; blockedLabels: string[] } {
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  const blockedLabels: string[] = [];

  for (const slug of LEGAL_PAGE_SLUGS) {
    const page = bySlug.get(slug);
    const html = renderSafePublicLegalHtml(slug, page?.content, settings);
    if (!html) {
      blockedLabels.push(LEGAL_PAGE_LABELS[slug]);
    }
  }

  return { ready: blockedLabels.length === 0, blockedLabels };
}

export async function getProductionReadinessSummary(): Promise<ProductionReadinessSummary> {
  const supabase = await getAdminSupabase();
  const settings = await getAdminShopSettings();
  const deploy = runProductionDeployReadiness();

  const [
    legalPages,
    mondialRelayRates,
    activeDevSeedProductCount,
    categoriesResult,
    productsResult,
    pendingReviewCount,
  ] = await Promise.all([
    listAdminLegalPages(),
    listAdminShippingRatesForProvider("mondial_relay"),
    countActiveDevSeedProducts().catch(() => 0),
    supabase
      ?.from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true) ?? Promise.resolve({ count: 0 }),
    supabase?.from("products").select("slug, status").eq("status", "active") ??
      Promise.resolve({ data: [] }),
    countPendingReviews().catch(() => 0),
  ]);

  const shopForLegal = settings ? adminSettingsToShopSettings(settings) : null;
  const legalPagesReadiness = evaluateCheckoutLegalPagesReadiness(
    legalPages.map((page) => ({ slug: page.slug, content: page.content })),
    shopForLegal,
  );

  const input: ProductionReadinessInput = {
    legalReady: isLegalPublicationReady(shopForLegal),
    legalMissingLabels: getLegalPublicationMissingLabels(shopForLegal),
    activeCategoryCount: categoriesResult?.count ?? 0,
    activeRealProductCount: countActiveRealProducts(productsResult?.data ?? []),
    activeDevSeedProductCount: activeDevSeedProductCount,
    legalPagesCheckoutReady: legalPagesReadiness.ready,
    legalPagesBlockedLabels: legalPagesReadiness.blockedLabels,
    mondialRelayActiveRateCount: mondialRelayRates.filter((rate) => rate.isActive)
      .length,
    deployEnvValid: deploy.valid,
    deployEnvErrors: deploy.errors,
    deployEnvWarnings: deploy.warnings,
    analyticsEnabled: settings?.analyticsEnabled ?? false,
    pendingReviewCount,
  };

  return buildProductionReadinessSummary(input);
}
