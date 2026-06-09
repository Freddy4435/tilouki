import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { assertNoError, SupabaseDataError } from "@/lib/supabase/errors";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { CreateOrderInput, CreatedOrder, OrderTrackingInfo } from "@/types/catalog";
import type { Database } from "@/types/database";

type VariantWithProduct = Database["public"]["Tables"]["product_variants"]["Row"] & {
  product: Pick<
    Database["public"]["Tables"]["products"]["Row"],
    "id" | "name" | "status" | "slug"
  > | null;
};

interface ResolvedLineItem {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  sizeLabel: string | null;
  ageLabel: string | null;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

async function resolveLineItems(
  items: CreateOrderInput["items"],
): Promise<ResolvedLineItem[]> {
  if (items.length === 0) {
    throw new SupabaseDataError("Le panier est vide.");
  }

  const admin = createAdminClient();
  const variantIds = items.map((item) => item.variantId);

  const { data, error } = await admin
    .from("product_variants")
    .select(`*, product:products(id, name, status, slug)`)
    .in("id", variantIds)
    .eq("is_active", true);

  assertNoError(error, "resolveLineItems");

  const variantMap = new Map(
    ((data ?? []) as VariantWithProduct[]).map((variant) => [variant.id, variant]),
  );

  return items.map((item) => {
    const variant = variantMap.get(item.variantId);

    if (!variant) {
      throw new SupabaseDataError(`Variante introuvable : ${item.variantId}`);
    }

    if (!variant.product || variant.product.status !== "active") {
      throw new SupabaseDataError(`Produit indisponible pour la variante ${variant.sku}`);
    }

    if (variant.stock_quantity < item.quantity) {
      throw new SupabaseDataError(
        `Stock insuffisant pour ${variant.product.name} (${variant.size_label ?? variant.sku}).`,
      );
    }

    if (item.quantity <= 0) {
      throw new SupabaseDataError("Quantité invalide.");
    }

    return {
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      sku: variant.sku,
      sizeLabel: variant.size_label,
      ageLabel: variant.age_label,
      quantity: item.quantity,
      unitPriceCents: variant.price_cents,
      totalPriceCents: variant.price_cents * item.quantity,
    };
  });
}

export async function createOrderFromCheckout(
  input: CreateOrderInput,
): Promise<CreatedOrder> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré pour createOrderFromCheckout.");
  }

  const admin = createAdminClient();
  const lineItems = await resolveLineItems(input.items);

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalPriceCents, 0);
  const discountCents = input.discountCents ?? 0;
  const shippingCents = input.shippingCents;
  const totalCents = subtotalCents + shippingCents - discountCents;

  if (totalCents < 0) {
    throw new SupabaseDataError("Total de commande invalide.");
  }

  const { data: orderNumber, error: orderNumberError } = await admin.rpc(
    "generate_order_number",
  );

  assertNoError(orderNumberError, "generate_order_number");

  if (!orderNumber) {
    throw new SupabaseDataError("Impossible de générer un numéro de commande.");
  }

  const currency = input.currency ?? "EUR";

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_email: input.customerEmail,
      customer_first_name: input.customerFirstName,
      customer_last_name: input.customerLastName,
      customer_phone: input.customerPhone,
      status: "pending",
      payment_status: "pending",
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      discount_cents: discountCents,
      total_cents: totalCents,
      currency,
      relay_point_id: input.relayPoint.id,
      relay_point_name: input.relayPoint.name,
      relay_point_address: input.relayPoint.address,
      relay_point_zip: input.relayPoint.zip,
      relay_point_city: input.relayPoint.city,
      relay_point_country: input.relayPoint.country,
      pending_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select(
      "id, order_number, tracking_token, subtotal_cents, shipping_cents, discount_cents, total_cents, currency",
    )
    .single();

  if (orderError || !order) {
    throw new SupabaseDataError("Échec de création de la commande.", orderError);
  }

  const orderItemsPayload = lineItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    product_name: item.productName,
    sku: item.sku,
    size_label: item.sizeLabel,
    age_label: item.ageLabel,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    total_price_cents: item.totalPriceCents,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(orderItemsPayload);

  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    throw new SupabaseDataError("Échec de création des lignes de commande.", itemsError);
  }

  try {
    await updateStockAfterOrder(order.id);
  } catch (stockError) {
    await admin.from("order_items").delete().eq("order_id", order.id);
    await admin.from("orders").delete().eq("id", order.id);
    throw stockError;
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    trackingToken: order.tracking_token,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    discountCents: order.discount_cents,
    totalCents: order.total_cents,
    currency: order.currency,
  };
}

export async function updateStockAfterOrder(orderId: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré pour updateStockAfterOrder.");
  }

  const admin = createAdminClient();
  const notePrefix = `order:${orderId}`;

  const { data: existingMovements, error: existingError } = await admin
    .from("inventory_movements")
    .select("id")
    .eq("type", "sale")
    .like("note", `${notePrefix}%`)
    .limit(1);

  assertNoError(existingError, "updateStockAfterOrder/check");

  if (existingMovements && existingMovements.length > 0) {
    return;
  }

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  assertNoError(itemsError, "updateStockAfterOrder/items");

  if (!items?.length) {
    throw new SupabaseDataError(`Aucune ligne pour la commande ${orderId}.`);
  }

  for (const item of items) {
    if (!item.variant_id) continue;

    const { error: rpcError } = await admin.rpc("record_sale_movement", {
      p_variant_id: item.variant_id,
      p_quantity: item.quantity,
      p_note: `${notePrefix}:${item.variant_id}`,
    });

    if (rpcError) {
      throw new SupabaseDataError(
        `Échec décrément stock variante ${item.variant_id}.`,
        rpcError,
      );
    }
  }
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

export interface OrderConfirmation {
  orderNumber: string;
  trackingToken: string;
  paymentStatus: string;
  totalCents: number;
  currency: string;
}

export async function updateOrderStripeSession(
  orderId: string,
  stripeSessionId: string,
): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ stripe_session_id: stripeSessionId })
    .eq("id", orderId);

  assertNoError(error, "updateOrderStripeSession");
}

export async function getOrderByStripeSessionId(
  stripeSessionId: string,
): Promise<OrderConfirmation | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("order_number, tracking_token, payment_status, total_cents, currency")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  assertNoError(error, "getOrderByStripeSessionId");
  if (!data) return null;

  return {
    orderNumber: data.order_number,
    trackingToken: data.tracking_token,
    paymentStatus: data.payment_status,
    totalCents: data.total_cents,
    currency: data.currency,
  };
}

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export interface OrderForWebhook extends OrderRow {
  items: OrderItemRow[];
}

export type FulfillPaidOrderResult =
  | { status: "fulfilled"; order: OrderForWebhook }
  | { status: "already_fulfilled"; order: OrderForWebhook }
  | { status: "skipped"; reason: string };

export async function getOrderById(orderId: string): Promise<OrderForWebhook | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();

  assertNoError(error, "getOrderById");

  if (!order) return null;

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  assertNoError(itemsError, "getOrderById/items");

  return { ...(order as OrderRow), items: items ?? [] };
}

export async function getOrderByPaymentIntentId(
  paymentIntentId: string,
): Promise<OrderForWebhook | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  assertNoError(error, "getOrderByPaymentIntentId");

  if (!order) return null;

  return getOrderById(order.id);
}

async function ensureOrderNumber(orderId: string): Promise<string> {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();

  assertNoError(error, "ensureOrderNumber");

  if (order?.order_number) {
    return order.order_number;
  }

  const { data: orderNumber, error: numberError } = await admin.rpc("generate_order_number");
  assertNoError(numberError, "ensureOrderNumber/generate");

  if (!orderNumber) {
    throw new SupabaseDataError("Impossible de générer un numéro de commande.");
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({ order_number: orderNumber })
    .eq("id", orderId);

  assertNoError(updateError, "ensureOrderNumber/update");

  return orderNumber;
}

/**
 * Marque une commande comme payée uniquement si elle est encore `pending`.
 * @returns true si la mise à jour a eu lieu (première exécution).
 */
export async function markOrderPaid(
  orderId: string,
  stripePaymentIntentId: string | null,
): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      stripe_payment_intent_id: stripePaymentIntentId,
    })
    .eq("id", orderId)
    .eq("payment_status", "pending")
    .select("id")
    .maybeSingle();

  assertNoError(error, "markOrderPaid");

  return Boolean(data);
}

export async function releaseStockForPendingOrder(orderId: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const admin = createAdminClient();
  const notePrefix = `order:${orderId}`;
  const cancelPrefix = `cancel-pending:${orderId}`;

  const { data: existingCancel, error: cancelCheckError } = await admin
    .from("inventory_movements")
    .select("id")
    .eq("type", "cancel")
    .like("note", `${cancelPrefix}%`)
    .limit(1);

  assertNoError(cancelCheckError, "releaseStockForPendingOrder/check");

  if (existingCancel && existingCancel.length > 0) {
    return;
  }

  const { data: saleMovements, error: saleError } = await admin
    .from("inventory_movements")
    .select("variant_id, quantity")
    .eq("type", "sale")
    .like("note", `${notePrefix}%`);

  assertNoError(saleError, "releaseStockForPendingOrder/sales");

  for (const movement of saleMovements ?? []) {
    if (!movement.variant_id) continue;

    const { error: insertError } = await admin.from("inventory_movements").insert({
      variant_id: movement.variant_id,
      type: "cancel",
      quantity: movement.quantity,
      note: `${cancelPrefix}:${movement.variant_id}`,
    });

    if (insertError) {
      throw new SupabaseDataError(
        `Échec libération stock variante ${movement.variant_id}.`,
        insertError,
      );
    }
  }
}

export async function markOrderPaymentFailed(orderId: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({ payment_status: "failed", status: "cancelled" })
    .eq("id", orderId)
    .eq("payment_status", "pending")
    .select("id")
    .maybeSingle();

  assertNoError(error, "markOrderPaymentFailed");

  if (data) {
    await releaseStockForPendingOrder(orderId);
  }

  return Boolean(data);
}

export async function markOrderRefunded(orderId: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({
      status: "refunded",
      payment_status: "refunded",
    })
    .eq("id", orderId)
    .in("payment_status", ["paid", "pending"])
    .select("id")
    .maybeSingle();

  assertNoError(error, "markOrderRefunded");

  return Boolean(data);
}

export async function restoreStockAfterRefund(orderId: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const admin = createAdminClient();
  const notePrefix = `refund:order:${orderId}`;

  const { data: existingMovements, error: existingError } = await admin
    .from("inventory_movements")
    .select("id")
    .eq("type", "cancel")
    .like("note", `${notePrefix}%`)
    .limit(1);

  assertNoError(existingError, "restoreStockAfterRefund/check");

  if (existingMovements && existingMovements.length > 0) {
    return;
  }

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  assertNoError(itemsError, "restoreStockAfterRefund/items");

  for (const item of items ?? []) {
    if (!item.variant_id) continue;

    const { error: insertError } = await admin.from("inventory_movements").insert({
      variant_id: item.variant_id,
      type: "cancel",
      quantity: item.quantity,
      note: `${notePrefix}:${item.variant_id}`,
    });

    if (insertError) {
      throw new SupabaseDataError(
        `Échec restock remboursement variante ${item.variant_id}.`,
        insertError,
      );
    }
  }
}

/**
 * Traite un paiement confirmé : statut payé, stock, e-mails.
 * Idempotent — safe pour les retries Stripe.
 */
export async function fulfillPaidOrder(
  orderId: string,
  stripePaymentIntentId: string | null,
  stripeAmountTotalCents: number | null,
): Promise<FulfillPaidOrderResult> {
  const order = await getOrderById(orderId);

  if (!order) {
    return { status: "skipped", reason: "Commande introuvable." };
  }

  if (order.payment_status === "paid" && order.status === "paid") {
    return { status: "already_fulfilled", order };
  }

  if (order.payment_status !== "pending" || order.status !== "pending") {
    return {
      status: "skipped",
      reason: `Statut inattendu : ${order.status}/${order.payment_status}.`,
    };
  }

  if (
    stripeAmountTotalCents != null &&
    stripeAmountTotalCents !== order.total_cents
  ) {
    throw new SupabaseDataError(
      `Montant Stripe (${stripeAmountTotalCents}) ≠ total commande (${order.total_cents}).`,
    );
  }

  await ensureOrderNumber(orderId);

  const updated = await markOrderPaid(orderId, stripePaymentIntentId);

  if (!updated) {
    const refreshed = await getOrderById(orderId);
    if (refreshed?.payment_status === "paid") {
      return { status: "already_fulfilled", order: refreshed };
    }
    return { status: "skipped", reason: "Mise à jour du statut impossible." };
  }

  await updateStockAfterOrder(orderId);

  const fulfilledOrder = await getOrderById(orderId);
  if (!fulfilledOrder) {
    throw new SupabaseDataError(`Commande ${orderId} introuvable après fulfillment.`);
  }

  return { status: "fulfilled", order: fulfilledOrder };
}

export async function getOrderByTrackingToken(
  token: string,
): Promise<OrderTrackingInfo | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_by_tracking_token", {
    p_token: token,
  });

  if (error) {
    throw new SupabaseDataError("getOrderByTrackingToken", error);
  }

  const order = data?.[0];
  if (!order) return null;

  return {
    orderNumber: order.order_number,
    status: ORDER_STATUS_LABELS[order.status] ?? order.status,
    paymentStatus: order.payment_status,
    totalCents: order.total_cents,
    currency: order.currency,
    createdAt: order.created_at,
    trackingNumber: order.tracking_number,
  };
}

/**
 * Annule les commandes pending expirées et libère le stock réservé.
 * À appeler via cron (Vercel Cron ou tâche planifiée).
 */
export async function expirePendingOrders(): Promise<number> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: expiredOrders, error } = await admin
    .from("orders")
    .select("id")
    .eq("payment_status", "pending")
    .eq("status", "pending")
    .lt("pending_expires_at", now);

  assertNoError(error, "expirePendingOrders");

  let count = 0;
  for (const row of expiredOrders ?? []) {
    const cancelled = await markOrderPaymentFailed(row.id);
    if (cancelled) count += 1;
  }

  return count;
}

export async function anonymizeCustomerByEmail(email: string): Promise<number> {
  if (!isSupabaseAdminConfigured()) {
    throw new SupabaseDataError("Supabase admin non configuré.");
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) return 0;

  const admin = createAdminClient();
  const token = `anon-${Date.now()}`;

  const { data, error } = await admin
    .from("orders")
    .update({
      customer_email: `anonymise+${token}@tilouki.invalid`,
      customer_first_name: "Anonymisé",
      customer_last_name: "Anonymisé",
      customer_phone: null,
      relay_point_name: null,
      relay_point_address: null,
      relay_point_zip: null,
      relay_point_city: null,
    })
    .ilike("customer_email", normalized)
    .select("id");

  assertNoError(error, "anonymizeCustomerByEmail");
  return data?.length ?? 0;
}
