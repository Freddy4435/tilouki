"use server";

import { revalidatePath } from "next/cache";

import { createStripeRefund } from "@/lib/stripe/create-refund";
import { assertStripeConfigured } from "@/lib/stripe/client";
import { getAdminOrder } from "@/lib/supabase/queries/admin/orders";
import { logSecure } from "@/lib/security/log";
import { adminOrderRefundSchema } from "@/lib/validations/admin-order";
import { requireAdmin } from "@/server/auth";

export async function createOrderRefundAction(
  input: unknown,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const user = await requireAdmin();
  const parsed = adminOrderRefundSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    assertStripeConfigured();
  } catch {
    return { error: "Stripe n'est pas configuré." };
  }

  const order = await getAdminOrder(parsed.data.orderId);
  if (!order) return { error: "Commande introuvable." };

  if (order.paymentStatus !== "paid") {
    return { error: "Seules les commandes payées peuvent être remboursées." };
  }

  if (!order.stripePaymentIntentId) {
    return { error: "Aucun Payment Intent Stripe associé à cette commande." };
  }

  const amountCents =
    parsed.data.mode === "full" ? undefined : parsed.data.amountCents;

  if (amountCents != null && amountCents > order.totalCents) {
    return {
      error: `Le montant ne peut pas dépasser ${(order.totalCents / 100).toFixed(2)} €.`,
    };
  }

  try {
    const refund = await createStripeRefund({
      paymentIntentId: order.stripePaymentIntentId,
      amountCents,
      reason: parsed.data.reason,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        admin_user: user.email ?? user.id,
      },
    });

    logSecure("info", "Remboursement Stripe initié depuis l'admin", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      refundId: refund.refundId,
      amountCents: refund.amountCents,
      mode: parsed.data.mode,
    });

    revalidatePath(`/admin/commandes/${order.id}`);
    revalidatePath("/admin/commandes");

    const amountLabel = (refund.amountCents / 100).toFixed(2);
    return {
      success: true,
      message:
        parsed.data.mode === "full"
          ? `Remboursement intégral de ${amountLabel} € initié. Le statut sera mis à jour par Stripe.`
          : `Remboursement partiel de ${amountLabel} € initié. Le client recevra un e-mail de confirmation.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Stripe.";
    return { error: `Échec du remboursement : ${message}` };
  }
}
