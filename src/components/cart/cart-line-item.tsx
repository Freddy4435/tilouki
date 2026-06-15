"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getLineStockIssue } from "@/lib/cart/calculations";
import type { CartLineItem as CartLineItemType } from "@/lib/cart/types";
import { cn, formatPrice } from "@/lib/utils";

interface CartLineItemProps {
  item: CartLineItemType;
  compact?: boolean;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}

function variantSubtitle(item: CartLineItemType): string {
  return [item.sizeLabel, item.ageLabel].filter(Boolean).join(" · ");
}

export function CartLineItem({
  item,
  compact = false,
  onUpdateQuantity,
  onRemove,
}: CartLineItemProps) {
  const hasIssue = getLineStockIssue(item) !== null;
  const subtitle = variantSubtitle(item);

  return (
    <article
      className={cn(
        "flex gap-3",
        compact ? "py-3" : "bg-card rounded-2xl border p-4 shadow-[var(--shadow-soft)]",
        hasIssue && "border-amber-500/40",
      )}
    >
      <Link
        href={`/produit/${item.slug}`}
        className={cn(
          "bg-muted relative shrink-0 overflow-hidden rounded-xl",
          compact ? "size-16" : "size-24",
        )}
        onClick={compact ? undefined : undefined}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            className="object-cover"
            sizes={compact ? "64px" : "96px"}
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/produit/${item.slug}`}
              className={cn(
                "hover:text-primary font-medium transition-colors",
                compact && "line-clamp-2 text-sm",
              )}
            >
              {item.productName}
            </Link>
            {subtitle ? (
              <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
            ) : null}
            {!compact ? (
              <p className="text-muted-foreground mt-1 text-xs">Réf. {item.sku}</p>
            ) : null}
          </div>
          <p className="shrink-0 font-semibold tabular-nums">
            {formatPrice(item.unitPriceCents * item.quantity)}
          </p>
        </div>

        {hasIssue ? (
          <p className="text-destructive text-xs font-medium">
            {item.stockQuantity <= 0
              ? "Rupture de stock"
              : `Plus que ${item.stockQuantity} en stock`}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Diminuer la quantité"
              onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Augmenter la quantité"
              disabled={item.quantity >= item.stockQuantity}
              onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size={compact ? "icon-sm" : "sm"}
            aria-label="Retirer du panier"
            onClick={() => onRemove(item.variantId)}
          >
            <Trash2 className="size-4" />
            {!compact ? <span>Retirer</span> : null}
          </Button>
        </div>
      </div>
    </article>
  );
}
