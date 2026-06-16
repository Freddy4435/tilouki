import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { useOptionalShop } from "@/components/providers/shop-provider";
import { defaultShopSettings } from "@/lib/shop/defaults";
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
  const shop = useOptionalShop();
  const minShippingCents = shop?.minShippingCents ?? defaultShopSettings.minShippingCents;
  const hasReturnPolicy = Boolean(shop?.returnPolicy?.trim());
  const compact = variant === "cta";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border",
        compact
          ? "border-border/70 bg-muted/25 px-3 py-2.5"
          : "border-tilouki-jade/25 bg-tilouki-jade-soft/35 px-3.5 py-3",
        className,
      )}
    >
      <ul
        className={cn(
          "text-foreground flex flex-wrap gap-x-4 gap-y-1.5",
          compact ? "text-xs" : "text-sm",
        )}
      >
        <li className="inline-flex items-center gap-1.5 font-medium">
          <Truck className="text-tilouki-teal-dark size-3.5 shrink-0" aria-hidden />
          Livraison relais dès {formatPrice(minShippingCents)}
        </li>
        {hasReturnPolicy ? (
          <li className="inline-flex items-center gap-1.5 font-medium">
            <RotateCcw className="text-tilouki-teal-dark size-3.5 shrink-0" aria-hidden />
            Retours — voir conditions
          </li>
        ) : null}
        {compact ? (
          <li className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck
              className="text-tilouki-teal-dark size-3.5 shrink-0"
              aria-hidden
            />
            Paiement sécurisé Stripe
          </li>
        ) : null}
      </ul>
      {!compact ? (
        <p className="text-muted-foreground mt-2 text-xs">
          <Link
            href="/livraison-retours"
            className="text-tilouki-teal-dark font-semibold hover:underline"
          >
            Détails livraison &amp; retours
          </Link>
        </p>
      ) : null}
    </div>
  );
}
