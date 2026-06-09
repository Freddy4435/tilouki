import type { AdminOrderListItem } from "@/lib/supabase/queries/admin/orders";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/status-labels";
import { formatPrice } from "@/lib/utils";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function ordersToCsv(orders: AdminOrderListItem[]): string {
  const headers = [
    "Numéro",
    "Client",
    "E-mail",
    "Date",
    "Total",
    "Paiement",
    "Statut",
    "Point relais",
  ];

  const rows = orders.map((order) => [
    order.orderNumber,
    order.customerName,
    order.customerEmail,
    new Date(order.createdAt).toISOString(),
    formatPrice(order.totalCents),
    PAYMENT_STATUS_LABELS[order.paymentStatus],
    ORDER_STATUS_LABELS[order.status],
    order.relayPointLabel ?? "",
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}
