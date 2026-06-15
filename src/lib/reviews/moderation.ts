import type { ProductReviewStatus } from "@/types/catalog";

export function canTransitionReviewStatus(
  current: ProductReviewStatus,
  next: ProductReviewStatus,
): boolean {
  if (current === next) return false;
  if (next === "pending") return false;
  if (next === "published") return current === "pending" || current === "rejected";
  if (next === "rejected") return current === "pending" || current === "published";
  return false;
}

export function resolvePublishedAtOnModeration(
  nextStatus: ProductReviewStatus,
  existingPublishedAt: string | null,
  nowIso: string,
): string | null {
  if (nextStatus === "published") {
    return existingPublishedAt ?? nowIso;
  }
  return null;
}
