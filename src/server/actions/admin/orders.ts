"use server";

import { revalidatePath } from "next/cache";

import {
  canTransitionTo,
  requiresTrackingForShip,
} from "@/lib/admin/order-transitions";
import { sendShippingConfirmation } from "@/lib/email";
import { getAdminOrder } from "@/lib/supabase/queries/admin/orders";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import {
  actionToStatus,
  orderStatusActionSchema,
  updateOrderInternalNotesSchema,
  updateOrderTrackingSchema,
} from "@/lib/validations/admin-order";
import { requireAdmin } from "@/server/auth";
import type { OrderStatus } from "@/types/database";

function revalidateOrder(orderId: string) {
  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${orderId}`);
}

async function recordStatusHistory(
  orderId: string,
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
  note: string | null,
  changedBy: string | null,
) {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: fromStatus,
    to_status: toStatus,
    note,
    changed_by: changedBy,
  });
}

export async function performOrderActionAction(
  input: unknown,
): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const parsed = orderStatusActionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Action invalide." };
  }

  const { orderId, action, trackingNumber } = parsed.data;
  const toStatus = actionToStatus(action);

  const order = await getAdminOrder(orderId);
  if (!order) return { error: "Commande introuvable." };

  const transition = canTransitionTo(
    { status: order.status, paymentStatus: order.paymentStatus },
    toStatus,
  );
  if (!transition.allowed) {
    return { error: transition.error ?? "Transition non autorisée." };
  }

  if (requiresTrackingForShip(toStatus) && !trackingNumber?.trim() && !order.trackingNumber) {
    return { error: "Un numéro de suivi est requis pour marquer comme expédiée." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const updatePayload: {
    status: OrderStatus;
    tracking_number?: string | null;
  } = { status: toStatus };

  if (trackingNumber !== undefined && trackingNumber !== null) {
    updatePayload.tracking_number = trackingNumber.trim() || null;
  } else if (toStatus === "shipped" && order.trackingNumber) {
    updatePayload.tracking_number = order.trackingNumber;
  }

  const { error } = await supabase.from("orders").update(updatePayload).eq("id", orderId);
  if (error) return { error: error.message };

  await recordStatusHistory(
    orderId,
    order.status,
    toStatus,
    trackingNumber?.trim() || null,
    user.id,
  );

  if (toStatus === "shipped") {
    const updated = await getAdminOrder(orderId);
    if (updated) {
      try {
        await sendShippingConfirmation(updated);
      } catch {
        // Ne bloque pas la mise à jour si l'e-mail échoue
      }
    }
  }

  revalidateOrder(orderId);
  return {};
}

export async function updateOrderTrackingAction(
  input: unknown,
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = updateOrderTrackingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const order = await getAdminOrder(parsed.data.orderId);
  if (!order) return { error: "Commande introuvable." };

  if (order.paymentStatus === "paid" && !["preparing", "shipped"].includes(order.status)) {
    return {
      error: "Le suivi ne peut être modifié qu'en préparation ou après expédition.",
    };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const { error } = await supabase
    .from("orders")
    .update({ tracking_number: parsed.data.trackingNumber })
    .eq("id", parsed.data.orderId);

  if (error) return { error: error.message };

  revalidateOrder(parsed.data.orderId);
  return {};
}

export async function updateOrderInternalNotesAction(
  input: unknown,
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = updateOrderInternalNotesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Notes invalides." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const { error } = await supabase
    .from("orders")
    .update({ internal_notes: parsed.data.internalNotes?.trim() || null })
    .eq("id", parsed.data.orderId);

  if (error) return { error: error.message };

  revalidateOrder(parsed.data.orderId);
  return {};
}

/** @deprecated Utiliser performOrderActionAction */
export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string | null,
): Promise<{ error?: string }> {
  const actionMap: Partial<Record<OrderStatus, "mark_preparing" | "mark_shipped" | "mark_delivered" | "cancel">> = {
    preparing: "mark_preparing",
    shipped: "mark_shipped",
    delivered: "mark_delivered",
    cancelled: "cancel",
  };
  const action = actionMap[status];
  if (!action) {
    return { error: "Utilisez les actions de gestion de commande." };
  }
  return performOrderActionAction({ orderId, action, trackingNumber });
}
