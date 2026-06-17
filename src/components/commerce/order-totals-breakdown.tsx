import { Clock } from "lucide-react";

import { formatDeliveryArrivalSummary } from "@/lib/shipping/delivery-estimate";
import type { CarrierName } from "@/lib/shipping/types";
import { cn, formatPrice } from "@/lib/utils";

interface OrderTotalsBreakdownProps {
  subtotalCents: number;
  shippingCents: number;
  discountCents?: number;
  discountLabel?: string;
  /** Libellé sous la ligne livraison (ex. tranche poids). */
  shippingNote?: string;
  carrier?: CarrierName;
  showDeliveryEstimate?: boolean;
  totalLabel?: string;
  className?: string;
}

/** Sous-total, livraison, remise et total TTC — panier et checkout. */
export function OrderTotalsBreakdown({
  subtotalCents,
  shippingCents,
  discountCents = 0,
  discountLabel = "Remise",
  shippingNote,
  carrier = "mondial_relay",
  showDeliveryEstimate = false,
  totalLabel = "Total TTC",
  className,
}: OrderTotalsBreakdownProps) {
  const totalCents = subtotalCents + shippingCents - discountCents;

  return (
    <div className={cn("space-y-2 text-sm", className)}>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Sous-total TTC</span>
        <span className="font-semibold tabular-nums">{formatPrice(subtotalCents)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Livraison point relais TTC</span>
        <span className="font-semibold tabular-nums">{formatPrice(shippingCents)}</span>
      </div>
      {shippingNote ? (
        <p className="text-muted-foreground text-xs leading-relaxed">{shippingNote}</p>
      ) : null}
      {discountCents > 0 ? (
        <div className="flex justify-between gap-4 text-emerald-800">
          <span>{discountLabel}</span>
          <span className="font-semibold tabular-nums">−{formatPrice(discountCents)}</span>
        </div>
      ) : null}
      {showDeliveryEstimate ? (
        <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            {formatDeliveryArrivalSummary(carrier)}
          </span>
        </p>
      ) : null}
      <div className="border-border/70 flex justify-between gap-4 border-t pt-2 text-base font-bold">
        <span>{totalLabel}</span>
        <span className="tabular-nums">{formatPrice(totalCents)}</span>
      </div>
    </div>
  );
}
