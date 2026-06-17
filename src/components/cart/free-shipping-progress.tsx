"use client";

import { Truck } from "lucide-react";

import {
  computeFreeShippingProgress,
  resolveFreeShippingThresholdCents,
} from "@/lib/shop/free-shipping";
import { cn, formatPrice } from "@/lib/utils";

interface FreeShippingProgressProps {
  subtotalCents: number;
  className?: string;
  compact?: boolean;
}

export function FreeShippingProgressBar({
  subtotalCents,
  className,
  compact = false,
}: FreeShippingProgressProps) {
  const thresholdCents = resolveFreeShippingThresholdCents();
  if (thresholdCents == null) return null;

  const progress = computeFreeShippingProgress(subtotalCents, thresholdCents);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-tilouki-pistache/30 bg-tilouki-pistache-soft/40",
        compact ? "px-3 py-2" : "px-3.5 py-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <Truck
          className="text-tilouki-teal-dark mt-0.5 size-4 shrink-0"
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
            {progress.qualified ? (
              <>
                Livraison relais offerte — vous y êtes&nbsp;!
              </>
            ) : (
              <>
                Plus que{" "}
                <span className="text-tilouki-navy font-bold tabular-nums">
                  {formatPrice(progress.remainingCents)}
                </span>{" "}
                pour la livraison relais offerte
              </>
            )}
          </p>
          <div
            className="bg-tilouki-milk/80 h-1.5 overflow-hidden rounded-full"
            aria-hidden
          >
            <div
              className="bg-tilouki-navy h-full rounded-full transition-[width] duration-300"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
          {!compact ? (
            <p className="text-muted-foreground text-xs">
              Seuil à {formatPrice(progress.thresholdCents)} TTC — articles du panier uniquement.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
