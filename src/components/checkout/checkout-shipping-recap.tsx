"use client";

import { Clock, Package, RotateCcw } from "lucide-react";
import Link from "next/link";

import {
  CHECKOUT_DELIVERY_DELAY_NOTE,
  CHECKOUT_RETURN_SUMMARY,
  getCarrierEstimatedDelay,
  getCarrierMethodLabel,
} from "@/lib/shipping/delivery-copy";
import { formatRelayDistance } from "@/lib/shipping/labels";
import type { CarrierName } from "@/lib/shipping/types";
import { formatPrice } from "@/lib/utils";

export interface CheckoutShippingRecapRelayPoint {
  id: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  distanceMeters?: number;
  openingHours?: string;
}

interface CheckoutShippingRecapProps {
  carrier: CarrierName;
  carrierLabel: string;
  shippingCents: number;
  rateLabel: string;
  relayPoint?: CheckoutShippingRecapRelayPoint | null;
  showReturnInfo?: boolean;
  className?: string;
}

export function CheckoutShippingRecap({
  carrier,
  carrierLabel,
  shippingCents,
  rateLabel,
  relayPoint,
  showReturnInfo = false,
  className,
}: CheckoutShippingRecapProps) {
  const estimatedDelay = getCarrierEstimatedDelay(carrier);
  const methodLabel = getCarrierMethodLabel(carrier);

  return (
    <div className={className}>
      <div className="space-y-3 text-sm">
        <div>
          <p className="flex items-center gap-1.5 font-medium">
            <Package className="size-4 shrink-0" aria-hidden="true" />
            Livraison en point relais
          </p>
          <p className="text-muted-foreground mt-1">
            <span className="text-foreground font-medium">{carrierLabel}</span>
            {" — "}
            {methodLabel}
          </p>
        </div>

        {relayPoint?.id ? (
          <div className="text-muted-foreground leading-relaxed">
            <p className="text-foreground font-medium">{relayPoint.name}</p>
            <p>
              {relayPoint.address}
              <br />
              {relayPoint.zip} {relayPoint.city} ({relayPoint.country})
            </p>
            {typeof relayPoint.distanceMeters === "number" ? (
              <p className="mt-1 text-xs">
                {formatRelayDistance(relayPoint.distanceMeters)}
              </p>
            ) : null}
            {relayPoint.openingHours ? (
              <p className="mt-1 text-xs">Horaires : {relayPoint.openingHours}</p>
            ) : null}
            <p className="mt-1 text-xs">Réf. {relayPoint.id}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">
            Sélectionnez un point relais à l&apos;étape précédente.
          </p>
        )}

        <div className="bg-muted/40 rounded-lg border px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Frais de livraison TTC</span>
            <span className="font-semibold tabular-nums">
              {formatPrice(shippingCents)}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">Tranche {rateLabel}</p>
        </div>

        <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Délai indicatif :{" "}
            <strong className="text-foreground">{estimatedDelay}</strong> après
            expédition. {CHECKOUT_DELIVERY_DELAY_NOTE}
          </span>
        </p>

        {showReturnInfo ? (
          <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
            <RotateCcw className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {CHECKOUT_RETURN_SUMMARY}{" "}
              <Link
                href="/livraison-retours"
                className="font-medium text-foreground underline underline-offset-4"
                target="_blank"
              >
                Livraison et retours
              </Link>
              .
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
