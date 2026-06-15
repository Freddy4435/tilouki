import "server-only";

import { unstable_cache } from "next/cache";

import { computeRatingSummary, type RatingSummary } from "@/lib/reviews/ratings";
import { filterPublicReviews } from "@/lib/reviews/visibility";
import { CACHE_TAGS, REVALIDATE, productReviewsTag } from "@/lib/supabase/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertNoError, isMissingSchemaError } from "@/lib/supabase/errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  ProductRatingSummary,
  ProductReview,
  ProductReviewAdmin,
  ProductReviewStatus,
} from "@/types/catalog";

export const REVIEWS_PAGE_SIZE = 5;

type ReviewRow = {
  id: string;
  product_id: string;
  order_id: string | null;
  author_name: string;
  author_email: string;
  rating: number;
  title: string;
  body: string;
  status: ProductReviewStatus;
  created_at: string;
  published_at: string | null;
  product?: { name: string; slug: string } | null;
};

function mapPublicReview(row: ReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    authorName: row.author_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    verifiedPurchase: Boolean(row.order_id),
    createdAt: row.created_at,
    publishedAt: row.published_at,
  };
}

function mapAdminReview(row: ReviewRow): ProductReviewAdmin {
  return {
    ...mapPublicReview(row),
    status: row.status,
    authorEmail: row.author_email,
    productName: row.product?.name ?? "Produit",
    productSlug: row.product?.slug ?? "",
    orderId: row.order_id,
  };
}

async function fetchRatingSummaries(
  productIds: string[],
): Promise<Map<string, ProductRatingSummary>> {
  const summaries = new Map<string, ProductRatingSummary>();
  if (productIds.length === 0 || !isSupabaseConfigured()) return summaries;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("catalog_product_ratings")
    .select("product_id, review_count, rating_average")
    .in("product_id", productIds);

  if (error) {
    if (isMissingSchemaError(error)) return summaries;
    assertNoError(error, "getProductRatingSummaries");
  }

  for (const row of data ?? []) {
    summaries.set(row.product_id, {
      count: row.review_count,
      average: row.rating_average,
    });
  }

  return summaries;
}

export async function getProductRatingSummaries(
  productIds: string[],
): Promise<Map<string, ProductRatingSummary>> {
  const cacheKey = [...new Set(productIds)].sort().join(",");

  return unstable_cache(
    () => fetchRatingSummaries(productIds),
    ["product-rating-summaries", cacheKey],
    {
      tags: [CACHE_TAGS.reviews, CACHE_TAGS.products],
      revalidate: REVALIDATE.product,
    },
  )();
}

export async function getProductRatingSummary(
  productId: string,
): Promise<ProductRatingSummary | null> {
  const summaries = await getProductRatingSummaries([productId]);
  return summaries.get(productId) ?? null;
}

async function fetchPublishedReviewsPage(
  productId: string,
  page: number,
): Promise<{ reviews: ProductReview[]; total: number }> {
  if (!isSupabaseConfigured()) return { reviews: [], total: 0 };

  const supabase = createPublicClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * REVIEWS_PAGE_SIZE;
  const to = from + REVIEWS_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("product_reviews")
    .select(
      "id, product_id, order_id, author_name, rating, title, body, status, created_at, published_at",
      { count: "exact" },
    )
    .eq("product_id", productId)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    if (isMissingSchemaError(error)) {
      return { reviews: [], total: 0 };
    }
    assertNoError(error, "getPublishedReviewsForProduct");
  }

  const reviews = filterPublicReviews((data ?? []) as ReviewRow[]).map(mapPublicReview);
  return { reviews, total: count ?? reviews.length };
}

async function fetchProductReviewStats(
  productId: string,
): Promise<RatingSummary | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "published");

  if (error) {
    if (isMissingSchemaError(error)) return null;
    assertNoError(error, "fetchProductReviewStats");
  }
  return computeRatingSummary((data ?? []).map((row) => row.rating));
}

export async function getPublishedReviewsForProduct(
  productId: string,
  page = 1,
): Promise<{ reviews: ProductReview[]; total: number; stats: RatingSummary | null }> {
  return unstable_cache(
    async () => {
      const [{ reviews, total }, stats] = await Promise.all([
        fetchPublishedReviewsPage(productId, page),
        fetchProductReviewStats(productId),
      ]);

      return { reviews, total, stats };
    },
    ["published-reviews", productId, String(page)],
    {
      tags: [CACHE_TAGS.reviews, productReviewsTag(productId)],
      revalidate: REVALIDATE.product,
    },
  )();
}

export async function findVerifiedOrderIdForReview(
  productId: string,
  authorEmail: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const normalizedEmail = authorEmail.trim().toLowerCase();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_status", "paid")
    .ilike("customer_email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(20);

  assertNoError(ordersError, "findVerifiedOrderIdForReview.orders");

  const orderIds = (orders ?? []).map((order) => order.id);
  if (orderIds.length === 0) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("product_id", productId)
    .in("order_id", orderIds)
    .limit(1);

  assertNoError(itemsError, "findVerifiedOrderIdForReview.items");
  return items?.[0]?.order_id ?? null;
}

export async function createPendingProductReview(input: {
  productId: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title: string;
  body: string;
  orderId: string | null;
}): Promise<{ id: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: input.productId,
      author_name: input.authorName,
      author_email: input.authorEmail.trim().toLowerCase(),
      rating: input.rating,
      title: input.title,
      body: input.body,
      order_id: input.orderId,
      status: "pending",
    })
    .select("id")
    .single();

  assertNoError(error, "createPendingProductReview");
  return { id: data.id };
}

export async function listAdminReviews(filters?: {
  status?: ProductReviewStatus;
}): Promise<ProductReviewAdmin[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("product_reviews")
    .select(
      "id, product_id, order_id, author_name, author_email, rating, title, body, status, created_at, published_at, product:products(name, slug)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  assertNoError(error, "listAdminReviews");
  return ((data ?? []) as ReviewRow[]).map(mapAdminReview);
}

export async function countPendingReviews(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("product_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  assertNoError(error, "countPendingReviews");
  return count ?? 0;
}

export async function moderateProductReview(input: {
  reviewId: string;
  status: Extract<ProductReviewStatus, "published" | "rejected">;
  publishedAt: string | null;
}): Promise<ProductReviewAdmin | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      status: input.status,
      published_at: input.publishedAt,
    })
    .eq("id", input.reviewId)
    .select(
      "id, product_id, order_id, author_name, author_email, rating, title, body, status, created_at, published_at, product:products(name, slug)",
    )
    .maybeSingle();

  assertNoError(error, "moderateProductReview");
  return data ? mapAdminReview(data as ReviewRow) : null;
}

export async function hasPublishedProductReviews(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createPublicClient();
  const { count, error } = await supabase
    .from("product_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  if (error) {
    if (isMissingSchemaError(error)) return false;
    assertNoError(error, "hasPublishedProductReviews");
  }
  return (count ?? 0) > 0;
}

export function attachRatingSummariesToProducts<
  T extends { id: string; ratingAverage?: number | null; ratingCount?: number },
>(products: T[], summaries: Map<string, ProductRatingSummary>): T[] {
  return products.map((product) => {
    const summary = summaries.get(product.id);
    if (!summary || summary.count === 0) return product;
    return {
      ...product,
      ratingAverage: summary.average,
      ratingCount: summary.count,
    };
  });
}
