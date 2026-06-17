"use client";

import { Sparkles } from "lucide-react";

import { previewRitualBundleDiscount } from "@/lib/cart/ritual-bundle-discount";
import { cn, formatPrice } from "@/lib/utils";

interface RitualBundleBannerProps {
  subtotalCents: number;
  distinctLineCount: number;
  compact?: boolean;
  className?: string;
}

export function RitualBundleBanner({
  subtotalCents,
  distinctLineCount,
  compact = false,
  className,
}: RitualBundleBannerProps) {
  const bundle = previewRitualBundleDiscount(subtotalCents, distinctLineCount);

  if (subtotalCents <= 0) return null;

  const remaining = bundle.minItems - distinctLineCount;

  if (bundle.applied) {
    return (
      <div
        className={cn(
          "border-tilouki-sage/40 bg-tilouki-sage-soft/50 flex gap-2 rounded-xl border px-3 py-2.5 text-sm",
          className,
        )}
        role="status"
      >
        <Sparkles className="text-tilouki-sage mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <span className="font-medium">{bundle.label}</span>
          {!compact ? (
            <>
              {" "}
              — vous économisez{" "}
              <span className="font-semibold tabular-nums">
                {formatPrice(bundle.discountCents)}
              </span>{" "}
              sur cette commande (calculée au paiement).
            </>
          ) : (
            <> — −{formatPrice(bundle.discountCents)} au paiement.</>
          )}
        </p>
      </div>
    );
  }

  if (remaining <= 0) return null;

  return (
    <div
      className={cn(
        "border-border/70 bg-muted/40 text-muted-foreground flex gap-2 rounded-xl border px-3 py-2.5 text-sm",
        className,
      )}
    >
      <Sparkles className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
      <p>
        {remaining === 1 ? (
          <>
            Encore <span className="text-foreground font-medium">1 article</span> pour la
            remise tenue Tilouki (−{bundle.percent} %).
          </>
        ) : (
          <>
            Encore{" "}
            <span className="text-foreground font-medium">{remaining} articles</span> pour
            la remise tenue Tilouki (−{bundle.percent} %).
          </>
        )}
      </p>
    </div>
  );
}
