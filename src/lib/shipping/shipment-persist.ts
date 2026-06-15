import "server-only";

import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";
import type { ShipmentLabel, ShipmentStatus } from "@/lib/shipping/types";
import type { OrderStatus } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type AdminClient = SupabaseClient<Database>;

export interface PersistShipmentLabelInput {
  order: AdminOrderDetail;
  label: ShipmentLabel;
  /** Statut commande cible après génération d'étiquette. */
  orderStatus: OrderStatus;
  shipmentStatus: ShipmentStatus;
}

export interface PersistExternalShipmentInput {
  order: AdminOrderDetail;
  trackingNumber: string;
  carrierShipmentNumber?: string | null;
  labelUrl?: string | null;
  orderStatus: OrderStatus;
  shipmentStatus: ShipmentStatus;
}

function shipmentSnapshotFromOrder(order: AdminOrderDetail) {
  return {
    carrier: order.shippingProvider,
    service: order.shippingMethod,
    pickup_point_id: order.relayPointId,
    pickup_point_name: order.relayPointName,
    pickup_point_address: order.relayPointAddress,
    pickup_point_zip: order.relayPointZip,
    pickup_point_city: order.relayPointCity,
    pickup_point_country: order.relayPointCountry,
    weight_grams: order.totalWeightGrams,
  };
}

/** Persiste l'étiquette sur orders + shipments (source de vérité expédition). */
export async function persistShipmentLabel(
  supabase: AdminClient,
  input: PersistShipmentLabelInput,
): Promise<{ error?: string }> {
  const { order, label, orderStatus, shipmentStatus } = input;
  const now = new Date().toISOString();
  const shippedAt = orderStatus === "shipped" ? now : null;

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: orderStatus,
      tracking_number: label.shipmentNumber,
      shipping_number: label.shipmentNumber,
      shipping_label_url: label.labelUrl,
      label_created_at: now,
      shipped_at: shippedAt,
    })
    .eq("id", order.id);

  if (orderError) return { error: orderError.message };

  const { error: shipmentError } = await supabase.from("shipments").upsert(
    {
      order_id: order.id,
      ...shipmentSnapshotFromOrder(order),
      tracking_number: label.shipmentNumber,
      carrier_shipment_number: label.shipmentNumber,
      label_url: label.labelUrl,
      label_pdf_path: label.labelPdfPath?.trim() || null,
      status: shipmentStatus,
      label_created_at: now,
      shipped_at: shippedAt,
    },
    { onConflict: "order_id" },
  );

  if (shipmentError) return { error: shipmentError.message };

  return {};
}

/** Enregistre une étiquette créée hors API (ex. espace Chronopost). */
export async function persistExternalShipment(
  supabase: AdminClient,
  input: PersistExternalShipmentInput,
): Promise<{ error?: string }> {
  const {
    order,
    trackingNumber,
    carrierShipmentNumber,
    labelUrl,
    orderStatus,
    shipmentStatus,
  } = input;
  const now = new Date().toISOString();
  const shippedAt = orderStatus === "shipped" ? now : null;
  const shipmentNumber = carrierShipmentNumber?.trim() || trackingNumber;

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: orderStatus,
      tracking_number: trackingNumber,
      shipping_number: shipmentNumber,
      shipping_label_url: labelUrl?.trim() || null,
      label_created_at: now,
      shipped_at: shippedAt,
    })
    .eq("id", order.id);

  if (orderError) return { error: orderError.message };

  const { error: shipmentError } = await supabase.from("shipments").upsert(
    {
      order_id: order.id,
      ...shipmentSnapshotFromOrder(order),
      tracking_number: trackingNumber,
      carrier_shipment_number: shipmentNumber,
      label_url: labelUrl?.trim() || null,
      status: shipmentStatus,
      label_created_at: now,
      shipped_at: shippedAt,
    },
    { onConflict: "order_id" },
  );

  if (shipmentError) return { error: shipmentError.message };

  return {};
}
