"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canCancelOrder,
  getNextFulfillmentStatus,
  isTerminalStatus,
} from "@/lib/admin/order-transitions";
import { ORDER_STATUS_LABELS } from "@/lib/admin/status-labels";
import { performOrderActionAction } from "@/server/actions/admin/orders";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";
import type { OrderAdminAction } from "@/lib/validations/admin-order";

interface OrderActionsProps {
  order: Pick<
    AdminOrderDetail,
    "id" | "status" | "paymentStatus" | "orderNumber"
  > & {
    trackingNumber?: string | null;
    shippingNumber?: string | null;
  };
  compact?: boolean;
}

export function OrderActions({ order, compact = false }: OrderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [showShipForm, setShowShipForm] = useState(false);

  const run = (action: OrderAdminAction, trackingNumber?: string | null) => {
    startTransition(async () => {
      setError(null);
      const result = await performOrderActionAction({
        orderId: order.id,
        action,
        trackingNumber,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowShipForm(false);
      router.refresh();
    });
  };

  const nextStatus = getNextFulfillmentStatus(order.status);
  const canCancel = canCancelOrder({
    status: order.status,
    paymentStatus: order.paymentStatus,
  });
  const terminal = isTerminalStatus(order.status);

  if (terminal && !canCancel) {
    return compact ? null : (
      <p className="text-muted-foreground text-sm">Aucune action disponible.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`flex flex-wrap gap-2 ${compact ? "" : ""}`}>
        {order.status === "paid" ? (
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            disabled={isPending}
            onClick={() => run("mark_preparing")}
          >
            Passer en préparation
          </Button>
        ) : null}

        {order.status === "preparing" &&
        (order.trackingNumber?.trim() || order.shippingNumber) ? (
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            variant="outline"
            disabled={isPending}
            onClick={() => run("mark_shipped")}
          >
            Marquer comme expédiée
          </Button>
        ) : order.status === "preparing" ? (
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            variant="outline"
            disabled={isPending}
            onClick={() => setShowShipForm((v) => !v)}
          >
            Marquer comme expédiée
          </Button>
        ) : null}

        {order.status === "shipped" ? (
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            disabled={isPending}
            onClick={() => run("mark_delivered")}
          >
            Marquer livrée
          </Button>
        ) : null}

        {canCancel ? (
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              if (!confirm(`Annuler la commande ${order.orderNumber} ?`)) return;
              run("cancel");
            }}
          >
            Annuler
          </Button>
        ) : null}
      </div>

      {showShipForm ? (
        <div className="space-y-2 rounded-lg border p-3">
          <Label htmlFor={`tracking-${order.id}`}>Numéro de suivi *</Label>
          <Input
            id={`tracking-${order.id}`}
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Ex. 3S1234567890"
          />
          <Button
            type="button"
            size="sm"
            disabled={isPending || !tracking.trim()}
            onClick={() => run("mark_shipped", tracking.trim())}
          >
            Confirmer l&apos;expédition
          </Button>
        </div>
      ) : null}

      {!compact && nextStatus && !terminal ? (
        <p className="text-muted-foreground text-xs">
          Prochaine étape : {ORDER_STATUS_LABELS[nextStatus]}
        </p>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
