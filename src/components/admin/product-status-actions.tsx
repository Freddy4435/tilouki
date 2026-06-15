"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { ProductStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  formatPublishBlockMessage,
  getProductReadinessIssues,
  isReadyToPublish,
  mapImagesToReadiness,
  type ProductReadinessVariant,
} from "@/lib/admin/product-readiness";
import {
  deleteProductAction,
  setProductStatusAction,
} from "@/server/actions/admin/products";
import type { ProductStatus } from "@/types/database";

interface ProductStatusActionsProps {
  productId: string;
  status: ProductStatus;
  hasOrders: boolean;
  images?: Array<{ url: string; alt?: string | null; sortOrder?: number }>;
  /** @deprecated Préférer images */
  imagesCount?: number;
  variants?: ProductReadinessVariant[];
  categoryId?: string | null;
  slug?: string;
}

export function ProductStatusActions({
  productId,
  status,
  hasOrders,
  images,
  imagesCount = 0,
  variants = [],
  categoryId,
  slug,
}: ProductStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ error?: string }>) => {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  const publish = () => {
    const issues = getProductReadinessIssues({
      images: images ? mapImagesToReadiness(images) : undefined,
      imagesCount,
      variants,
      categoryId,
      slug,
    });
    if (!isReadyToPublish(issues)) {
      alert(formatPublishBlockMessage(issues));
      return;
    }
    run(() => setProductStatusAction(productId, "active"));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ProductStatusBadge status={status} />
      {status !== "active" ? (
        <Button type="button" size="sm" disabled={isPending} onClick={publish}>
          Publier
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => setProductStatusAction(productId, "draft"))}
        >
          Remettre en brouillon
        </Button>
      )}
      {status !== "archived" ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => run(() => setProductStatusAction(productId, "archived"))}
        >
          Archiver
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => setProductStatusAction(productId, "draft"))}
        >
          Désarchiver
        </Button>
      )}
      {!hasOrders ? (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            if (!confirm("Supprimer définitivement ce produit ?")) return;
            startTransition(async () => {
              const result = await deleteProductAction(productId);
              if (result.error) {
                alert(result.error);
                return;
              }
              router.push("/admin/produits");
            });
          }}
        >
          Supprimer
        </Button>
      ) : (
        <span className="text-muted-foreground text-xs">
          Lié à des commandes — suppression impossible
        </span>
      )}
    </div>
  );
}
