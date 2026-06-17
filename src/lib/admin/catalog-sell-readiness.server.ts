import "server-only";

import {
  getCatalogSellReadinessSummary as summarizeCatalogSellReadiness,
  type CatalogSellReadinessInput,
} from "@/lib/admin/catalog-sell-readiness";
import {
  getProductReadinessIssues,
  isReadyToPublish,
  mapImagesToReadiness,
  mapVariantsToReadiness,
} from "@/lib/admin/product-readiness";
import { hasLegacyDemoProductImages } from "@/lib/catalog/product-sellability";
import { isDevSeedProductSlug } from "@/lib/catalog/dev-seed";
import { countActiveDevSeedProducts } from "@/lib/catalog/dev-seed-guard";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";

type ProductRow = {
  id: string;
  slug: string;
  status: string;
  category_id: string | null;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
  }> | null;
  variants: Array<{
    stock_quantity: number;
    weight_grams: number | null;
    is_active: boolean;
    price_cents: number;
    size_label: string | null;
    age_label: string | null;
  }> | null;
};

function countReadinessIssuesForProduct(row: ProductRow): number {
  const issues = getProductReadinessIssues({
    images: mapImagesToReadiness(
      (row.images ?? []).map((image) => ({
        url: image.url,
        alt: image.alt,
        sortOrder: image.sort_order,
      })),
    ),
    variants: mapVariantsToReadiness(
      (row.variants ?? []).map((variant) => ({
        stockQuantity: variant.stock_quantity,
        weightGrams: variant.weight_grams,
        isActive: variant.is_active,
        priceCents: variant.price_cents,
        sizeLabel: variant.size_label,
        ageLabel: variant.age_label,
      })),
    ),
    categoryId: row.category_id,
    slug: row.slug,
  });

  return isReadyToPublish(issues) ? 0 : 1;
}

export async function loadCatalogSellReadinessInput(): Promise<CatalogSellReadinessInput> {
  const supabase = await getAdminSupabase();
  if (!supabase) {
    return {
      activeDevSeedProductCount: 0,
      activeRealProductCount: 0,
      activeProductsWithReadinessIssues: 0,
      activeProductsWithLegacyDemoImages: 0,
      draftProductsReadyToPublish: 0,
    };
  }

  const [productsResult, activeDevSeedProductCount] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, slug, status, category_id,
         images:product_images(id, url, alt, sort_order),
         variants:product_variants(stock_quantity, weight_grams, is_active, price_cents, size_label, age_label)`,
      )
      .neq("status", "archived"),
    countActiveDevSeedProducts().catch(() => 0),
  ]);

  const products = (productsResult.data ?? []) as ProductRow[];

  let activeRealProductCount = 0;
  let activeProductsWithReadinessIssues = 0;
  let activeProductsWithLegacyDemoImages = 0;
  let draftProductsReadyToPublish = 0;

  for (const product of products) {
    const issueCount = countReadinessIssuesForProduct(product);
    const isActive = product.status === "active";
    const isDraft = product.status === "draft";
    const readinessImages = mapImagesToReadiness(
      (product.images ?? []).map((image) => ({
        url: image.url,
        alt: image.alt,
        sortOrder: image.sort_order,
      })),
    );

    if (isActive && !isDevSeedProductSlug(product.slug)) {
      activeRealProductCount += 1;
    }

    if (isActive && issueCount > 0) {
      activeProductsWithReadinessIssues += 1;
    }

    if (
      isActive &&
      !isDevSeedProductSlug(product.slug) &&
      hasLegacyDemoProductImages(readinessImages)
    ) {
      activeProductsWithLegacyDemoImages += 1;
    }

    if (isDraft && issueCount === 0 && !isDevSeedProductSlug(product.slug)) {
      draftProductsReadyToPublish += 1;
    }
  }

  return {
    activeDevSeedProductCount,
    activeRealProductCount,
    activeProductsWithReadinessIssues,
    activeProductsWithLegacyDemoImages,
    draftProductsReadyToPublish,
  };
}

export async function getCatalogSellReadinessSummary() {
  const input = await loadCatalogSellReadinessInput();
  return summarizeCatalogSellReadiness(input);
}
