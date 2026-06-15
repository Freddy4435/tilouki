"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  canTransitionReviewStatus,
  resolvePublishedAtOnModeration,
} from "@/lib/reviews/moderation";
import { CACHE_TAGS, productReviewsTag, productTag } from "@/lib/supabase/cache";
import { moderateProductReview } from "@/lib/supabase/queries/reviews";
import { requireAdmin } from "@/server/auth";
import type { ProductReviewStatus } from "@/types/catalog";

export async function moderateReviewAction(
  reviewId: string,
  nextStatus: Extract<ProductReviewStatus, "published" | "rejected">,
  currentStatus: ProductReviewStatus,
  productSlug: string,
  productId: string,
  publishedAt: string | null,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (!canTransitionReviewStatus(currentStatus, nextStatus)) {
    return { error: "Transition de statut invalide." };
  }

  try {
    await moderateProductReview({
      reviewId,
      status: nextStatus,
      publishedAt: resolvePublishedAtOnModeration(
        nextStatus,
        publishedAt,
        new Date().toISOString(),
      ),
    });

    revalidateTag(CACHE_TAGS.reviews, "max");
    revalidateTag(productReviewsTag(productId), "max");
    revalidateTag(productTag(productSlug), "max");
    revalidateTag(CACHE_TAGS.products, "max");
    revalidatePath(`/produit/${productSlug}`);
    revalidatePath("/admin/avis");
    revalidatePath("/admin/preparation");

    return {};
  } catch {
    return { error: "Modération impossible." };
  }
}
