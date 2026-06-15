"use client";

import { resolveColorSwatch } from "@/lib/catalog/color-swatches";
import { getVisibleColorOptions } from "@/lib/catalog/product-card-data";
import type { ProductCardColorOption } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface ProductCardColorSwatchesProps {
  options: ProductCardColorOption[];
  selectedColor: string | null;
  onSelectColor: (color: string | null) => void;
  className?: string;
}

export function ProductCardColorSwatches({
  options,
  selectedColor,
  onSelectColor,
  className,
}: ProductCardColorSwatchesProps) {
  if (options.length < 2) return null;

  const { visible, overflow } = getVisibleColorOptions(options);

  return (
    <div
      role="group"
      aria-label="Coloris disponibles"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {visible.map((option) => {
        const swatch = resolveColorSwatch(option.color);
        const isSelected = selectedColor === option.color;

        return (
          <button
            key={option.color}
            type="button"
            title={swatch.label}
            aria-label={`Coloris ${swatch.label}`}
            aria-pressed={isSelected}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelectColor(isSelected ? null : option.color);
            }}
            className={cn(
              "focus-visible:ring-primary size-5 rounded-full ring-1 ring-black/10 transition-transform outline-none focus-visible:ring-2 active:scale-95",
              isSelected && "ring-primary ring-2",
              swatch.isNeutral && "bg-muted",
            )}
            style={swatch.isNeutral ? undefined : { background: swatch.background }}
          />
        );
      })}
      {overflow > 0 ? (
        <span className="text-muted-foreground text-[11px] font-semibold">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
