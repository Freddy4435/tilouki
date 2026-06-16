"use client";

import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";

import { CheckoutShippingRecap } from "@/components/checkout/checkout-shipping-recap";
import { OrderTotalsBreakdown } from "@/components/commerce/order-totals-breakdown";
import { Separator } from "@/components/ui/separator";
import { useCartShipping } from "@/hooks/use-cart-shipping";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/lib/validations/checkout";

interface CheckoutSummaryProps {
  form: UseFormReturn<CheckoutFormValues>;
}

function variantLabel(sizeLabel: string | null, ageLabel: string | null): string {
  const parts: string[] = [];
  if (sizeLabel) parts.push(`Taille ${sizeLabel}`);
  if (ageLabel && ageLabel !== sizeLabel) parts.push(`Âge ${ageLabel}`);
  return parts.join(" · ");
}

export function CheckoutSummary({ form }: CheckoutSummaryProps) {
  const items = useCartStore((s) => s.items);
  const carrier = useCartStore((s) => s.carrier);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const { shippingCents, carriers, rateLabel } = useCartShipping();
  const carrierLabel =
    carriers.find((info) => info.id === carrier)?.label ??
    (carrier === "chronopost" ? "Chronopost relais" : "Mondial Relay");
  const relayPoint = form.watch("relayPoint");

  return (
    <aside
      id="checkout-order-summary"
      className="bg-card space-y-4 rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24"
    >
      <div>
        <h2 className="text-lg font-semibold">Résumé de commande</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Articles, livraison et total TTC avant paiement Stripe.
        </p>
      </div>

      <ul className="space-y-3" aria-label="Articles commandés">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-3 text-sm">
            <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-lg">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-medium">{item.productName}</p>
              <p className="text-muted-foreground text-xs">
                {variantLabel(item.sizeLabel, item.ageLabel)}
                {variantLabel(item.sizeLabel, item.ageLabel) ? " · " : ""}
                Qté {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-right font-medium tabular-nums">
              {formatPrice(item.unitPriceCents * item.quantity)}
              <span className="text-muted-foreground block text-[10px] font-normal uppercase">
                TTC
              </span>
            </p>
          </li>
        ))}
      </ul>

      <Separator />

      <CheckoutShippingRecap
        carrier={carrier}
        carrierLabel={carrierLabel}
        shippingCents={shippingCents}
        rateLabel={rateLabel}
        relayPoint={relayPoint}
        showReturnInfo
      />

      <Separator />

      <OrderTotalsBreakdown
        subtotalCents={subtotalCents}
        shippingCents={shippingCents}
        totalLabel="Total TTC"
      />
    </aside>
  );
}
