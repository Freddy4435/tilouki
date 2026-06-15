"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { moderateReviewAction } from "@/server/actions/admin/reviews";
import type { ProductReviewStatus } from "@/types/catalog";

interface ReviewModerationActionsProps {
  reviewId: string;
  currentStatus: ProductReviewStatus;
  productId: string;
  productSlug: string;
  publishedAt: string | null;
}

export function ReviewModerationActions({
  reviewId,
  currentStatus,
  productId,
  productSlug,
  publishedAt,
}: ReviewModerationActionsProps) {
  const [isPending, startTransition] = useTransition();

  const moderate = (status: "published" | "rejected") => {
    startTransition(async () => {
      await moderateReviewAction(
        reviewId,
        status,
        currentStatus,
        productSlug,
        productId,
        publishedAt,
      );
    });
  };

  if (currentStatus === "rejected") {
    return (
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() => moderate("published")}
      >
        Republier
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {currentStatus === "published" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => moderate("rejected")}
        >
          Rejeter
        </Button>
      ) : (
        <>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => moderate("published")}
          >
            Publier
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => moderate("rejected")}
          >
            Rejeter
          </Button>
        </>
      )}
    </div>
  );
}
