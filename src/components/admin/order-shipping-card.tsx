import { MapPin, Package, Truck } from "lucide-react";

import { OrderExpeditionPanel } from "@/components/admin/order-expedition-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatShippingMethod,
  formatShippingProvider,
} from "@/lib/shipping/labels";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";
import { formatPrice } from "@/lib/utils";

interface OrderShippingCardProps {
  order: AdminOrderDetail;
}

export function OrderShippingCard({ order }: OrderShippingCardProps) {
  if (!order.relayPointName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Livraison point relais</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Aucun point relais enregistré sur cette commande.
        </CardContent>
      </Card>
    );
  }

  const addressLine = [
    order.relayPointAddress,
    [order.relayPointZip, order.relayPointCity].filter(Boolean).join(" "),
    order.relayPointCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="size-4" />
          Livraison point relais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Transporteur
          </p>
          <p>
            {formatShippingProvider(order.shippingProvider)} —{" "}
            {formatShippingMethod(order.shippingMethod)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
            <MapPin className="size-3.5" />
            Point relais choisi
          </p>
          <p className="font-medium">{order.relayPointName}</p>
          <p className="text-muted-foreground leading-relaxed">{addressLine}</p>
          {order.relayPointId ? (
            <p className="text-muted-foreground font-mono text-xs">ID relais : {order.relayPointId}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-muted/40 rounded-lg border px-3 py-2">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Package className="size-3.5" />
              Poids colis
            </p>
            <p className="mt-1 font-medium tabular-nums">
              {order.totalWeightGrams != null ? `${order.totalWeightGrams} g` : "—"}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg border px-3 py-2">
            <p className="text-muted-foreground text-xs">Frais de livraison</p>
            <p className="mt-1 font-medium tabular-nums">{formatPrice(order.shippingCents)}</p>
            {order.shippingRateLabel ? (
              <p className="text-muted-foreground mt-0.5 text-xs">Tranche : {order.shippingRateLabel}</p>
            ) : null}
          </div>
        </div>

        <OrderExpeditionPanel order={order} />
      </CardContent>
    </Card>
  );
}
