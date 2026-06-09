import { formatPrice } from "@/lib/utils";

import type { OrderEmailItem, OrderEmailPayload, OrderEmailRelayPoint } from "@/lib/email/types";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatOrderMoney(cents: number, currency: string): string {
  return formatPrice(cents, currency);
}

export function formatItemVariant(item: OrderEmailItem): string {
  const parts = [item.sizeLabel, item.ageLabel].filter(Boolean);
  return parts.length > 0 ? ` (${parts.join(" · ")})` : "";
}

export function formatRelayPointText(relay: OrderEmailRelayPoint): string {
  const lines = [
    relay.name,
    relay.address,
    `${relay.zip} ${relay.city}`,
    relay.country && relay.country !== "FR" ? relay.country : null,
  ].filter(Boolean);
  return lines.join(", ");
}

export function formatRelayPointHtml(relay: OrderEmailRelayPoint): string {
  const countryLine =
    relay.country && relay.country !== "FR"
      ? `<br/>${escapeHtml(relay.country)}`
      : "";

  return [
    escapeHtml(relay.name),
    `<br/>${escapeHtml(relay.address)}`,
    `<br/>${escapeHtml(relay.zip)} ${escapeHtml(relay.city)}`,
    countryLine,
  ].join("");
}

export function formatOrderItemsText(order: OrderEmailPayload): string {
  return order.items
    .map((item) => {
      const variant = formatItemVariant(item);
      return `• ${item.productName}${variant} × ${item.quantity} — ${formatOrderMoney(item.totalPriceCents, order.currency)}`;
    })
    .join("\n");
}

export function formatOrderTotalsText(order: OrderEmailPayload): string {
  const lines = [
    `Sous-total : ${formatOrderMoney(order.subtotalCents, order.currency)}`,
    `Livraison : ${formatOrderMoney(order.shippingCents, order.currency)}`,
  ];

  if (order.discountCents > 0) {
    lines.push(`Réduction : −${formatOrderMoney(order.discountCents, order.currency)}`);
  }

  lines.push(`Total : ${formatOrderMoney(order.totalCents, order.currency)}`);
  return lines.join("\n");
}

export function buildOrderItemsTableHtml(order: OrderEmailPayload): string {
  const rows = order.items
    .map((item) => {
      const variant = formatItemVariant(item);
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;color:#3f3f46;">
          ${escapeHtml(item.productName)}${escapeHtml(variant)}<br/>
          <span style="font-size:12px;color:#71717a;">Qté ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;text-align:right;color:#18181b;white-space:nowrap;">
          ${escapeHtml(formatOrderMoney(item.totalPriceCents, order.currency))}
        </td>
      </tr>`;
    })
    .join("");

  const discountRow =
    order.discountCents > 0
      ? `<tr>
          <td style="padding:6px 0;color:#71717a;">Réduction</td>
          <td style="padding:6px 0;text-align:right;color:#71717a;">−${escapeHtml(formatOrderMoney(order.discountCents, order.currency))}</td>
        </tr>`
      : "";

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr>
        <th align="left" style="padding:0 0 8px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Article</th>
        <th align="right" style="padding:0 0 8px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Montant</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr>
        <td style="padding:10px 0;color:#71717a;">Sous-total</td>
        <td style="padding:10px 0;text-align:right;color:#71717a;">${escapeHtml(formatOrderMoney(order.subtotalCents, order.currency))}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;">Livraison</td>
        <td style="padding:6px 0;text-align:right;color:#71717a;">${escapeHtml(formatOrderMoney(order.shippingCents, order.currency))}</td>
      </tr>
      ${discountRow}
      <tr>
        <td style="padding:12px 0 0;font-weight:600;color:#18181b;">Total</td>
        <td style="padding:12px 0 0;text-align:right;font-weight:600;color:#18181b;">${escapeHtml(formatOrderMoney(order.totalCents, order.currency))}</td>
      </tr>
    </tbody>
  </table>`;
}
