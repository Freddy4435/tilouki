import type { ProductReviewStatus } from "@/types/catalog";

export function isPublicReviewStatus(status: ProductReviewStatus): boolean {
  return status === "published";
}

export function filterPublicReviews<T extends { status: ProductReviewStatus }>(
  reviews: T[],
): T[] {
  return reviews.filter((review) => isPublicReviewStatus(review.status));
}
