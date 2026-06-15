"use client";

import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/catalog";

interface ProductVariantPickerProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
  disabled?: boolean;
}

function variantPrimaryLabel(variant: ProductVariant): string {
  return variant.sizeLabel ?? variant.ageLabel ?? variant.color ?? variant.sku;
}

function variantSecondaryLabel(variant: ProductVariant): string | null {
  const primary = variantPrimaryLabel(variant);
  const parts: string[] = [];

  if (variant.sizeLabel && variant.ageLabel) parts.push(variant.ageLabel);
  if (variant.color && variant.color !== primary) parts.push(variant.color);

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function ProductVariantPicker({
  variants,
  selectedVariantId,
  onSelect,
  disabled = false,
}: ProductVariantPickerProps) {
  if (variants.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Aucune taille disponible pour le moment.
      </p>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby="variant-size-label"
      className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-3"
    >
      {variants.map((variant) => {
        const outOfStock = variant.stockQuantity <= 0;
        const isSelected = variant.id === selectedVariantId;
        const primary = variantPrimaryLabel(variant);
        const secondary = variantSecondaryLabel(variant);

        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled || outOfStock}
            aria-label={
              outOfStock
                ? `${primary} — épuisé`
                : `${primary}${secondary ? `, ${secondary}` : ""}${isSelected ? ", sélectionné" : ""}`
            }
            onClick={() => onSelect(variant.id)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center rounded-[var(--radius-button)] border px-2 py-2 text-center transition-all",
              isSelected &&
                "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]",
              !isSelected &&
                !outOfStock &&
                "border-border bg-card hover:border-primary/45 hover:bg-primary/5",
              outOfStock && "cursor-not-allowed opacity-45",
              disabled && !outOfStock && "opacity-60",
            )}
          >
            <span
              className={cn(
                "text-sm leading-tight font-bold",
                outOfStock && "line-through",
              )}
            >
              {primary}
            </span>
            {secondary ? (
              <span
                className={cn(
                  "mt-0.5 text-[10px] leading-tight",
                  isSelected ? "text-primary-foreground/85" : "text-muted-foreground",
                )}
              >
                {secondary}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function variantDisplayLabel(variant: ProductVariant): string {
  const parts = [variant.sizeLabel, variant.ageLabel, variant.color].filter(Boolean);
  return parts.join(" · ") || variant.sku;
}
