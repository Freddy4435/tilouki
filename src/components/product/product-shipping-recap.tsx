import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { useShop } from "@/components/providers/shop-provider";
import { CHECKOUT_RETURN_SUMMARY } from "@/lib/shipping/delivery-copy";
import { cn, formatPrice } from "@/lib/utils";

interface ProductShippingRecapProps {
  /** Bloc compact près du CTA d'achat */
  variant?: "default" | "cta";
  className?: string;
}

export function ProductShippingRecap({
  variant = "default",
  className,
}: ProductShippingRecapProps) {
  const { minShippingCents } = useShop();
  const compact = variant === "cta";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border",
        compact
          ? "border-border/70 bg-muted/30 px-3 py-2.5"
          : "border-tilouki-jade/25 bg-tilouki-jade-soft/35 px-3.5 py-3",
        className,
      )}
    >
      <ul
        className={cn(
          "text-foreground flex flex-col gap-1.5",
          compact
            ? "text-xs"
            : "text-sm sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-1",
        )}
      >
        <li className="inline-flex items-center gap-1.5 font-medium">
          <Truck className="text-tilouki-teal-dark size-3.5 shrink-0" aria-hidden />
          Point relais dès {formatPrice(minShippingCents)}
        </li>
        <li className="inline-flex items-center gap-1.5 font-medium">
          <RotateCcw className="text-tilouki-teal-dark size-3.5 shrink-0" aria-hidden />
          Retours 14 jours
        </li>
        {compact ? (
          <li className="text-muted-foreground inline-flex items-center gap-1.5">
            <ShieldCheck
              className="text-tilouki-teal-dark size-3.5 shrink-0"
              aria-hidden
            />
            Paiement sécurisé
          </li>
        ) : null}
      </ul>
      <p
        className={cn(
          "text-muted-foreground mt-1.5",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        {CHECKOUT_RETURN_SUMMARY}{" "}
        <Link
          href="/livraison-retours"
          className="text-tilouki-teal-dark font-semibold hover:underline"
        >
          Détails livraison &amp; retours
        </Link>
      </p>
    </div>
  );
}
