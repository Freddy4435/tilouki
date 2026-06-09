import type { OrderStatus, PaymentStatus } from "@/types/database";

export interface OrderTransitionContext {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

const FULFILLMENT_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: "preparing",
  preparing: "shipped",
  shipped: "delivered",
};

export function getNextFulfillmentStatus(status: OrderStatus): OrderStatus | null {
  return FULFILLMENT_NEXT[status] ?? null;
}

export function canCancelOrder(ctx: OrderTransitionContext): boolean {
  return ctx.paymentStatus !== "paid" && ctx.status === "pending";
}

export function canTransitionTo(
  ctx: OrderTransitionContext,
  toStatus: OrderStatus,
): { allowed: boolean; error?: string } {
  if (ctx.status === toStatus) {
    return { allowed: true };
  }

  if (toStatus === "cancelled") {
    if (!canCancelOrder(ctx)) {
      return {
        allowed: false,
        error: "Seules les commandes non payées peuvent être annulées.",
      };
    }
    return { allowed: true };
  }

  if (ctx.paymentStatus === "paid") {
    const expectedNext = FULFILLMENT_NEXT[ctx.status];
    if (expectedNext !== toStatus) {
      return {
        allowed: false,
        error: `Transition invalide : ${ctx.status} → ${toStatus}. Suivez le flux de préparation.`,
      };
    }
    return { allowed: true };
  }

  if (ctx.paymentStatus === "pending" && ctx.status === "pending") {
    return {
      allowed: false,
      error: "Commande en attente de paiement — seule l'annulation est autorisée.",
    };
  }

  return {
    allowed: false,
    error: "Modification non autorisée pour cette commande.",
  };
}

export function requiresTrackingForShip(toStatus: OrderStatus): boolean {
  return toStatus === "shipped";
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "delivered" || status === "cancelled" || status === "refunded";
}
