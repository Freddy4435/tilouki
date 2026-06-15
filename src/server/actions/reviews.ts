"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";

import { logSecure } from "@/lib/security/log";
import { checkRateLimit, rateLimitDeniedMessage } from "@/lib/security/rate-limit";
import { CACHE_TAGS, productReviewsTag } from "@/lib/supabase/cache";
import {
  createPendingProductReview,
  findVerifiedOrderIdForReview,
} from "@/lib/supabase/queries/reviews";
import { productReviewFormSchema } from "@/lib/validations/product-review";

export async function submitProductReviewAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  if (formData.get("website")) {
    return { success: true };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const limit = await checkRateLimit({
    key: `${ip}:product-review`,
    limit: 5,
    windowSec: 3600,
  });

  if (!limit.allowed) {
    return { error: rateLimitDeniedMessage(limit) };
  }

  const parsed = productReviewFormSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const orderId = await findVerifiedOrderIdForReview(
      parsed.data.productId,
      parsed.data.authorEmail,
    );

    await createPendingProductReview({
      productId: parsed.data.productId,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      orderId,
    });

    logSecure("info", "Avis produit soumis", {
      productId: parsed.data.productId,
      productSlug: parsed.data.productSlug,
      verified: Boolean(orderId),
    });

    revalidateTag(CACHE_TAGS.reviews, "max");
    revalidateTag(productReviewsTag(parsed.data.productId), "max");

    return { success: true };
  } catch (error) {
    logSecure("error", "Échec dépôt avis produit", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Impossible d'enregistrer votre avis pour le moment." };
  }
}
