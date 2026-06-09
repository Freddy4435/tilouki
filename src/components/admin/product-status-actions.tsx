"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { ProductStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  deleteProductAction,
  setProductStatusAction,
} from "@/server/actions/admin/products";
import type { ProductStatus } from "@/types/database";

interface ProductStatusActionsProps {
  productId: string;
  status: ProductStatus;
  hasOrders: boolean;
}

export function ProductStatusActions({
  productId,
  status,
  hasOrders,
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ProductStatusBadge status={status} />
      {status !== "active" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => setProductStatusAction(productId, "active"))}
        >
          Activer
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => setProductStatusAction(productId, "draft"))}
        >
          Désactiver
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
