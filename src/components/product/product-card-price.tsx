import { cn, formatPrice } from "@/lib/utils";

interface ProductCardPriceProps {
  priceCents: number;
  compareAtPriceCents?: number | null;
  compact?: boolean;
  premium?: boolean;
  className?: string;
}

function discountPercent(priceCents: number, compareAtPriceCents: number): number {
  return Math.round((1 - priceCents / compareAtPriceCents) * 100);
}

export function ProductCardPrice({
  priceCents,
  compareAtPriceCents,
  compact = false,
  premium = false,
  className,
}: ProductCardPriceProps) {
  const hasDiscount = compareAtPriceCents != null && compareAtPriceCents > priceCents;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span
          className={cn(
            "font-bold tracking-tight tabular-nums",
            hasDiscount ? "text-tilouki-persimmon-dark" : "text-tilouki-navy",
            compact ? "text-[0.9375rem] leading-none" : premium ? "text-xl" : "text-base sm:text-lg",
          )}
        >
          {formatPrice(priceCents)}
        </span>

        {hasDiscount ? (
          <>
            <span
              className={cn(
                "text-tilouki-ink-muted decoration-tilouki-ink-muted/70 tabular-nums line-through",
                compact ? "text-[11px]" : "text-xs sm:text-sm",
              )}
              aria-label={`Prix initial ${formatPrice(compareAtPriceCents)}`}
            >
              {formatPrice(compareAtPriceCents)}
            </span>
            <span
              className="bg-tilouki-persimmon-dark/10 text-tilouki-persimmon-dark inline-flex rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide uppercase"
              aria-label={`Remise ${discountPercent(priceCents, compareAtPriceCents)} pour cent`}
            >
              −{discountPercent(priceCents, compareAtPriceCents)}&nbsp;%
            </span>
          </>
        ) : (
          <span className="text-muted-foreground sr-only">Prix TTC</span>
        )}
      </div>
    </div>
  );
}
