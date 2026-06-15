import { defaultShopSettings } from "@/lib/shop/defaults";
import { buildStorefrontNavigation } from "@/lib/navigation/build-storefront-nav";
import type { ShopCategory, ShopSettings } from "@/lib/shop/types";
import { normalizeShopAnnouncements } from "@/lib/announcements/validation";
import { normalizeEditorialBlocks } from "@/lib/editorial/validation";
import { normalizeShopSocialLinks } from "@/lib/social/validation";
import type { Category } from "@/types/catalog";
import type { Database } from "@/types/database";

type ShopSettingsRow = Database["public"]["Views"]["shop_settings_public"]["Row"];

export function mapShopCategory(category: Category): ShopCategory {
  return {
    slug: category.slug,
    label: category.name,
    href: `/categorie/${category.slug}`,
    description: category.description ?? undefined,
  };
}

export function mapShopSettings(
  row: ShopSettingsRow | null,
  categories: ShopCategory[],
  minShippingCents: number,
  navigation = buildStorefrontNavigation(categories, []),
): ShopSettings {
  const envPrimary = process.env.NEXT_PUBLIC_SHOP_PRIMARY_COLOR;
  const envName = process.env.NEXT_PUBLIC_SHOP_NAME;
  const envEmail = process.env.NEXT_PUBLIC_SHOP_CONTACT_EMAIL;

  if (!row) {
    return {
      ...defaultShopSettings,
      minShippingCents,
      categories: categories.length > 0 ? categories : defaultShopSettings.categories,
      navigation,
      ...(envName ? { name: envName } : {}),
      ...(envPrimary ? { primaryColor: envPrimary } : {}),
      ...(envEmail ? { contactEmail: envEmail } : {}),
    };
  }

  return {
    id: row.id,
    name: envName ?? row.shop_name,
    tagline: defaultShopSettings.tagline,
    description: defaultShopSettings.description,
    heroImageUrl: row.hero_image_url,
    legalName: row.legal_name,
    legalStatus: row.legal_status,
    siret: row.siret,
    address: row.address,
    contactEmail: envEmail ?? row.email ?? defaultShopSettings.contactEmail,
    contactEmailConfigured: Boolean(envEmail?.trim() || row.email?.trim()),
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
    primaryColor: envPrimary ?? defaultShopSettings.primaryColor,
    announcementsEnabled: row.announcements_enabled ?? false,
    announcements: normalizeShopAnnouncements(row.announcements),
    socialLinks: normalizeShopSocialLinks(row.social_links),
    editorialBlocks: normalizeEditorialBlocks(row.editorial_blocks),
    minShippingCents,
    categories: categories.length > 0 ? categories : defaultShopSettings.categories,
    navigation,
  };
}
