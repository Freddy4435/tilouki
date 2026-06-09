import "server-only";

import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import type { OrderStatus, PaymentStatus } from "@/types/database";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalCents: number;
  createdAt: string;
  relayPointLabel: string | null;
}

export interface AdminOrderStatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  customerPhone: string | null;
  customerFirstName: string;
  customerLastName: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  currency: string;
  trackingNumber: string | null;
  trackingToken: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  relayPointId: string | null;
  relayPointName: string | null;
  relayPointAddress: string | null;
  relayPointZip: string | null;
  relayPointCity: string | null;
  relayPointCountry: string | null;
  internalNotes: string | null;
  statusHistory: AdminOrderStatusHistoryEntry[];
  items: {
    id: string;
    productName: string;
    sku: string;
    sizeLabel: string | null;
    ageLabel: string | null;
    quantity: number;
    unitPriceCents: number;
    totalPriceCents: number;
  }[];
}

function relayLabel(row: {
  relay_point_name: string | null;
  relay_point_city: string | null;
}): string | null {
  if (!row.relay_point_name) return null;
  return row.relay_point_city
    ? `${row.relay_point_name} (${row.relay_point_city})`
    : row.relay_point_name;
}

export async function listAdminOrders(filters?: {
  query?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}): Promise<AdminOrderListItem[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  let dbQuery = supabase
    .from("orders")
    .select(
      "id, order_number, customer_first_name, customer_last_name, customer_email, status, payment_status, total_cents, created_at, relay_point_name, relay_point_city",
    )
    .order("created_at", { ascending: false });

  if (filters?.status) {
    dbQuery = dbQuery.eq("status", filters.status);
  }

  if (filters?.paymentStatus) {
    dbQuery = dbQuery.eq("payment_status", filters.paymentStatus);
  }

  if (filters?.query?.trim()) {
    const term = filters.query.trim();
    dbQuery = dbQuery.or(
      `order_number.ilike.%${term}%,customer_email.ilike.%${term}%,customer_last_name.ilike.%${term}%,customer_first_name.ilike.%${term}%`,
    );
  }

  const { data } = await dbQuery;

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: `${row.customer_first_name} ${row.customer_last_name}`.trim(),
    customerEmail: row.customer_email,
    status: row.status,
    paymentStatus: row.payment_status,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    relayPointLabel: relayLabel(row),
  }));
}

export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;

  const [itemsResult, historyResult] = await Promise.all([
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_status_history")
      .select("id, from_status, to_status, note, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const items = itemsResult.data;
  const history = historyResult.error ? [] : (historyResult.data ?? []);

  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: `${order.customer_first_name} ${order.customer_last_name}`.trim(),
    customerFirstName: order.customer_first_name,
    customerLastName: order.customer_last_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    status: order.status,
    paymentStatus: order.payment_status,
    totalCents: order.total_cents,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    discountCents: order.discount_cents,
    currency: order.currency,
    trackingNumber: order.tracking_number,
    trackingToken: order.tracking_token,
    stripeSessionId: order.stripe_session_id,
    stripePaymentIntentId: order.stripe_payment_intent_id,
    relayPointId: order.relay_point_id,
    relayPointName: order.relay_point_name,
    relayPointAddress: order.relay_point_address,
    relayPointZip: order.relay_point_zip,
    relayPointCity: order.relay_point_city,
    relayPointCountry: order.relay_point_country,
    relayPointLabel: relayLabel(order),
    internalNotes: order.internal_notes ?? null,
    createdAt: order.created_at,
    statusHistory: (history ?? []).map((entry) => ({
      id: entry.id,
      fromStatus: entry.from_status,
      toStatus: entry.to_status,
      note: entry.note,
      createdAt: entry.created_at,
    })),
    items: (items ?? []).map((item) => ({
      id: item.id,
      productName: item.product_name,
      sku: item.sku,
      sizeLabel: item.size_label,
      ageLabel: item.age_label,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
      totalPriceCents: item.total_price_cents,
    })),
  };
}

export async function listAdminOrdersForExport(): Promise<AdminOrderListItem[]> {
  return listAdminOrders();
}
