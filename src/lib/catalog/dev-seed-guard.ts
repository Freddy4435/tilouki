import "server-only";

import { DEV_SEED_CHECKOUT_BLOCKED_MESSAGE } from "@/lib/catalog/dev-seed";
import { DEV_SEED_PRODUCT_SLUGS } from "@/lib/catalog/dev-seed.fixture";
import {
  hasCommercialStorefrontImages,
  isStorefrontBlockedSlug,
} from "@/lib/catalog/product-sellability";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertNoError } from "@/lib/supabase/errors";

interface VariantWithProductSlug {
  product: {
    slug: string;
    images: Array<{ url: string; alt: string | null }> | null;
  } | null;
}

/**
 * Refuse le checkout en production si le panier contient un article non vendable
 * (démo, test technique, sans photo commerciale).
 */
export async function findStorefrontBlockedSlugInCheckoutItems(
  items: Array<{ variantId: string }>,
): Promise<string | null> {
  if (process.env.NODE_ENV !== "production" || items.length === 0) {
    return null;
  }

  const admin = createAdminClient();
  const variantIds = [...new Set(items.map((item) => item.variantId))];

  const { data, error } = await admin
    .from("product_variants")
    .select("product:products(slug, images:product_images(url, alt))")
    .in("id", variantIds);

  assertNoError(error, "findStorefrontBlockedSlugInCheckoutItems");

  for (const row of (data ?? []) as VariantWithProductSlug[]) {
    const product = row.product;
    const slug = product?.slug;
    if (!slug) continue;

    if (isStorefrontBlockedSlug(slug)) return slug;
    if (!hasCommercialStorefrontImages(product.images ?? [])) return slug;
  }

  return null;
}

/** Alias historique — même garde-fou élargi au storefront. */
export const findDevSeedSlugInCheckoutItems = findStorefrontBlockedSlugInCheckoutItems;

export { DEV_SEED_CHECKOUT_BLOCKED_MESSAGE };

/** Compte les produits démo encore actifs (dashboard admin). */
export async function countActiveDevSeedProducts(): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .in("slug", [...DEV_SEED_PRODUCT_SLUGS]);

  assertNoError(error, "countActiveDevSeedProducts");
  return count ?? 0;
}
