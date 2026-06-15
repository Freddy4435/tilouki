import { cn, formatPrice } from "@/lib/utils";

interface ProductCardPriceProps {
  priceCents: number;
  compareAtPriceCents?: number | null;
  compact?: boolean;
  className?: string;
}

function discountPercent(priceCents: number, compareAtPriceCents: number): number {
  return Math.round((1 - priceCents / compareAtPriceCents) * 100);
}

export function ProductCardPrice({
  priceCents,
  compareAtPriceCents,
  compact = false,
  className,
}: ProductCardPriceProps) {
  const hasDiscount = compareAtPriceCents != null && compareAtPriceCents > priceCents;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "text-foreground font-bold tracking-tight tabular-nums",
          hasDiscount && "text-tilouki-persimmon-dark",
          compact ? "text-base" : "text-lg sm:text-xl",
        )}
      >
        {formatPrice(priceCents)}
      </span>

      {hasDiscount ? (
        <>
          <span
            className={cn(
              "text-tilouki-ink-muted decoration-tilouki-ink-muted/70 tabular-nums line-through",
              compact ? "text-xs" : "text-sm",
            )}
            aria-label={`Prix initial ${formatPrice(compareAtPriceCents)}`}
          >
            {formatPrice(compareAtPriceCents)}
          </span>
          <span
            className="bg-tilouki-persimmon-dark text-background rounded px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase"
            aria-label={`Remise ${discountPercent(priceCents, compareAtPriceCents)} pour cent`}
          >
            −{discountPercent(priceCents, compareAtPriceCents)}&nbsp;%
          </span>
        </>
      ) : (
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase max-sm:sr-only">
          TTC
        </span>
      )}
    </div>
  );
}
