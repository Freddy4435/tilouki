"use server";

import { revalidatePath } from "next/cache";

import {
  canTransitionTo,
  requiresTrackingForShip,
} from "@/lib/admin/order-transitions";
import { sendShippingConfirmation } from "@/lib/email";
import { isKnownCarrier } from "@/lib/shipping/carriers";
import { ShipmentLabelError } from "@/lib/shipping/errors";
import { getShippingProvider } from "@/lib/shipping/provider";
import {
  persistExternalShipment,
  persistShipmentLabel,
} from "@/lib/shipping/shipment-persist";
import { logSecure } from "@/lib/security/log";
import { getAdminOrder } from "@/lib/supabase/queries/admin/orders";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import {
  getAdminShopSettings,
  type AdminShopSettings,
} from "@/lib/supabase/queries/admin/settings";
import {
  actionToStatus,
  createShippingLabelSchema,
  orderStatusActionSchema,
  registerExternalShipmentSchema,
  updateOrderInternalNotesSchema,
  updateOrderTrackingSchema,
} from "@/lib/validations/admin-order";
import { requireAdmin } from "@/server/auth";
import type { ShipmentLabel, ShipmentParty } from "@/lib/shipping/types";
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
    shipped_at?: string | null;
  } = { status: toStatus };

  if (trackingNumber !== undefined && trackingNumber !== null) {
    updatePayload.tracking_number = trackingNumber.trim() || null;
  } else if (toStatus === "shipped" && order.trackingNumber) {
    updatePayload.tracking_number = order.trackingNumber;
  }

  if (toStatus === "shipped") {
    updatePayload.shipped_at = new Date().toISOString();
  }

  const { error } = await supabase.from("orders").update(updatePayload).eq("id", orderId);
  if (error) return { error: error.message };

  if (toStatus === "shipped") {
    await supabase
      .from("shipments")
      .update({
        status: "shipped",
        shipped_at: updatePayload.shipped_at,
        tracking_number: updatePayload.tracking_number ?? order.trackingNumber,
      })
      .eq("order_id", orderId);
  }

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

/**
 * Décompose l'adresse boutique (champ libre) en rue / CP / ville.
 * Formats acceptés : "12 rue X, 75001 Paris" ou multilignes équivalentes.
 */
function parseShopAddress(
  address: string,
): { street: string; zip: string; city: string } | null {
  const normalized = address.replace(/\r?\n/g, ", ").trim();
  const match = normalized.match(/^(.*?)[,\s]+(\d{5})[,\s]+(.+)$/);
  if (!match) return null;

  const street = (match[1] ?? "").replace(/[,\s]+$/, "").trim();
  const zip = match[2] ?? "";
  const city = (match[3] ?? "").replace(/^[,\s]+/, "").trim();
  if (street.length < 2 || city.length < 2) return null;

  return { street, zip, city };
}

function buildSenderParty(
  settings: AdminShopSettings | null,
): { sender: ShipmentParty } | { error: string } {
  const name = (settings?.legalName || settings?.shopName || "").trim();
  const parsedAddress = parseShopAddress(settings?.address ?? "");

  if (!settings || !name || !parsedAddress) {
    return {
      error:
        "Adresse expéditeur incomplète : renseignez le nom et l'adresse de la boutique (rue, code postal, ville) dans les réglages.",
    };
  }

  return {
    sender: {
      name,
      street: parsedAddress.street,
      zip: parsedAddress.zip,
      city: parsedAddress.city,
      country: "FR",
      phone: settings.phone,
      email: settings.email,
    },
  };
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateFulfillmentSteps(
  order: NonNullable<Awaited<ReturnType<typeof getAdminOrder>>>,
  targetStatus: OrderStatus,
): { steps: OrderStatus[]; error?: string } {
  const steps: OrderStatus[] = [];
  let cursor: OrderStatus = order.status;

  while (cursor !== targetStatus) {
    const next =
      cursor === "paid"
        ? "preparing"
        : cursor === "preparing"
          ? "shipped"
          : null;
    if (!next) {
      return { steps, error: "Transition non autorisée pour cette commande." };
    }
    const transition = canTransitionTo(
      { status: cursor, paymentStatus: order.paymentStatus },
      next,
    );
    if (!transition.allowed) {
      return { steps, error: transition.error ?? "Transition non autorisée." };
    }
    steps.push(next);
    cursor = next;
  }

  return { steps };
}

export interface CreateShippingLabelResult {
  error?: string;
  shipmentNumber?: string;
  labelUrl?: string;
}

/**
 * Génère l'étiquette Mondial Relay d'une commande payée (statuts paid/preparing),
 * persiste numéro + URL, passe la commande en "shipped" via la machine d'états
 * et déclenche l'email d'expédition. La saisie manuelle du suivi reste un fallback.
 */
export async function createShippingLabelAction(
  input: unknown,
): Promise<CreateShippingLabelResult> {
  const user = await requireAdmin();
  const parsed = createShippingLabelSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Commande invalide." };
  }

  const order = await getAdminOrder(parsed.data.orderId);
  if (!order) return { error: "Commande introuvable." };

  if (order.paymentStatus !== "paid") {
    return { error: "L'étiquette ne peut être générée que pour une commande payée." };
  }
  if (!["paid", "preparing"].includes(order.status)) {
    return {
      error:
        "L'étiquette ne peut être générée qu'en statut « Payée » ou « En préparation ».",
    };
  }
  if (order.shippingNumber) {
    return { error: "Une étiquette a déjà été générée pour cette commande." };
  }
  if (
    !order.relayPointId ||
    !order.relayPointAddress ||
    !order.relayPointZip ||
    !order.relayPointCity
  ) {
    return { error: "Point relais incomplet sur cette commande." };
  }
  if (!order.totalWeightGrams || order.totalWeightGrams < 15) {
    return { error: "Poids du colis manquant ou invalide (minimum 15 g)." };
  }

  const { steps, error: stepsError } = validateFulfillmentSteps(order, "shipped");
  if (stepsError) return { error: stepsError };

  const senderResult = buildSenderParty(await getAdminShopSettings());
  if ("error" in senderResult) return senderResult;

  const carrier = isKnownCarrier(order.shippingProvider)
    ? order.shippingProvider
    : "mondial_relay";
  const provider = getShippingProvider(carrier);
  if (!provider.createShipmentLabel) {
    return {
      error:
        "La génération d'étiquette n'est pas disponible avec le transporteur configuré.",
    };
  }

  let label: ShipmentLabel;
  try {
    label = await provider.createShipmentLabel({
      orderId: order.id,
      orderNumber: order.orderNumber,
      sender: senderResult.sender,
      // Boutique 100 % point relais : pas d'adresse domicile client en base,
      // le destinataire est adressé au point relais choisi (livraison 24R).
      recipient: {
        name: order.customerName,
        street: order.relayPointAddress,
        zip: order.relayPointZip,
        city: order.relayPointCity,
        country: order.relayPointCountry ?? "FR",
        phone: order.customerPhone,
        email: order.customerEmail,
      },
      relayPointId: order.relayPointId,
      relayPointCountry: order.relayPointCountry ?? "FR",
      weightGrams: order.totalWeightGrams,
      deliveryMode: "24R",
    });
  } catch (error) {
    if (error instanceof ShipmentLabelError) {
      return { error: error.message };
    }
    logSecure("error", "admin: échec génération étiquette Mondial Relay", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Génération de l'étiquette impossible. Réessayez plus tard." };
  }

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const persistResult = await persistShipmentLabel(supabase, {
    order,
    label,
    orderStatus: "shipped",
    shipmentStatus: "shipped",
  });
  if (persistResult.error) return { error: persistResult.error };

  let fromStatus: OrderStatus | null = order.status;
  for (const step of steps) {
    await recordStatusHistory(
      order.id,
      fromStatus,
      step,
      `Étiquette Mondial Relay générée (n° ${label.shipmentNumber})`,
      user.id,
    );
    fromStatus = step;
  }

  const updated = await getAdminOrder(order.id);
  if (updated) {
    try {
      await sendShippingConfirmation(updated);
    } catch {
      // Ne bloque pas la génération si l'e-mail échoue
    }
  }

  revalidateOrder(order.id);
  return { shipmentNumber: label.shipmentNumber, labelUrl: label.labelUrl };
}

/**
 * Enregistre une étiquette créée hors API (ex. espace Chronopost),
 * persiste le suivi et passe la commande en expédiée.
 */
export async function registerExternalShipmentAction(
  input: unknown,
): Promise<CreateShippingLabelResult> {
  const user = await requireAdmin();
  const parsed = registerExternalShipmentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Saisie invalide." };
  }

  const order = await getAdminOrder(parsed.data.orderId);
  if (!order) return { error: "Commande introuvable." };

  if (order.paymentStatus !== "paid") {
    return { error: "Réservé aux commandes payées." };
  }
  if (!["paid", "preparing"].includes(order.status)) {
    return { error: "Commande non éligible à l'enregistrement d'étiquette." };
  }
  if (order.shippingNumber) {
    return { error: "Une étiquette est déjà enregistrée pour cette commande." };
  }

  const labelUrl = parsed.data.labelUrl?.trim() || null;
  if (labelUrl && !isValidHttpUrl(labelUrl)) {
    return { error: "URL d'étiquette invalide (http ou https requis)." };
  }

  const targetStatus: OrderStatus = parsed.data.markShipped ? "shipped" : "preparing";
  const { steps, error: stepsError } = parsed.data.markShipped
    ? validateFulfillmentSteps(order, "shipped")
    : validateFulfillmentSteps(order, "preparing");
  if (stepsError) return { error: stepsError };

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const persistResult = await persistExternalShipment(supabase, {
    order,
    trackingNumber: parsed.data.trackingNumber,
    carrierShipmentNumber: parsed.data.carrierShipmentNumber,
    labelUrl,
    orderStatus: targetStatus,
    shipmentStatus: parsed.data.markShipped ? "shipped" : "label_created",
  });
  if (persistResult.error) return { error: persistResult.error };

  let fromStatus: OrderStatus | null = order.status;
  for (const step of steps) {
    await recordStatusHistory(
      order.id,
      fromStatus,
      step,
      `Étiquette enregistrée manuellement (suivi ${parsed.data.trackingNumber})`,
      user.id,
    );
    fromStatus = step;
  }

  if (parsed.data.markShipped) {
    const updated = await getAdminOrder(order.id);
    if (updated) {
      try {
        await sendShippingConfirmation(updated);
      } catch {
        // Ne bloque pas l'enregistrement si l'e-mail échoue
      }
    }
  }

  revalidateOrder(order.id);
  return {
    shipmentNumber: parsed.data.carrierShipmentNumber ?? parsed.data.trackingNumber,
    labelUrl: labelUrl ?? undefined,
  };
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
