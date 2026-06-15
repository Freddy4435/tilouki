import { Star } from "lucide-react";

import { formatRatingAverage } from "@/lib/reviews/ratings";
import { cn } from "@/lib/utils";

interface ProductRatingStarsProps {
  average?: number | null;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <Star
      className={cn(
        "shrink-0",
        filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
        className,
      )}
      aria-hidden
    />
  );
}

export function ProductRatingStars({
  average,
  count = 0,
  size = "sm",
  showCount = true,
  className,
}: ProductRatingStarsProps) {
  if (!average || count <= 0) return null;

  const starSize = size === "md" ? "size-4" : "size-3.5";
  const rounded = Math.round(average);
  const label = `${formatRatingAverage(average)} sur 5, ${count} avis`;

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={label}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon key={index} filled={index < rounded} className={starSize} />
        ))}
      </div>
      {showCount ? (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatRatingAverage(average)} ({count})
        </span>
      ) : null}
    </div>
  );
}
