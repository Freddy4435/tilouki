"use client";

import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import { useCartShipping } from "@/hooks/use-cart-shipping";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import type { UseFormReturn } from "react-hook-form";

interface CheckoutSummaryProps {
  form: UseFormReturn<CheckoutFormValues>;
}

function variantLabel(sizeLabel: string | null, ageLabel: string | null): string {
  return [sizeLabel, ageLabel].filter(Boolean).join(" · ");
}

export function CheckoutSummary({ form }: CheckoutSummaryProps) {
  const items = useCartStore((s) => s.items);
  const carrier = useCartStore((s) => s.carrier);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const { shippingCents, carriers } = useCartShipping();
  const carrierLabel =
    carriers.find((info) => info.id === carrier)?.label ??
    (carrier === "chronopost" ? "Chronopost relais" : "Mondial Relay");
  const totalCents = subtotalCents + shippingCents;
  const relayPoint = form.watch("relayPoint");

  return (
    <aside className="space-y-4 rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="font-heading text-lg font-semibold">Résumé de commande</h2>

      <ul className="space-y-3">
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
                {variantLabel(item.sizeLabel, item.ageLabel)} · Qté {item.quantity}
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums">
              {formatPrice(item.unitPriceCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      {relayPoint?.id ? (
        <>
          <Separator />
          <div className="text-sm">
            <p className="font-medium">Livraison point relais</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{carrierLabel}</p>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              <span className="text-foreground font-medium">{relayPoint.name}</span>
              <br />
              {relayPoint.address}
              <br />
              {relayPoint.zip} {relayPoint.city} ({relayPoint.country})
            </p>
            {"openingHours" in relayPoint && relayPoint.openingHours ? (
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Horaires : {relayPoint.openingHours}
              </p>
            ) : null}
            <p className="text-muted-foreground mt-2 text-xs">Réf. {relayPoint.id}</p>
          </div>
        </>
      ) : null}

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Livraison point relais</span>
          <span className="tabular-nums">{formatPrice(shippingCents)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(totalCents)}</span>
        </div>
      </div>
    </aside>
  );
}
