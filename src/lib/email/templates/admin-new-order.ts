import {
  buildOrderItemsTableHtml,
  escapeHtml,
  formatOrderItemsText,
  formatOrderTotalsText,
  formatRelayPointHtml,
  formatRelayPointText,
} from "@/lib/email/format";
import { emailInfoBox, wrapEmailLayout } from "@/lib/email/templates/layout";
import type { OrderEmailPayload, RenderedEmail } from "@/lib/email/types";

export function renderAdminNewOrderEmail(order: OrderEmailPayload): RenderedEmail {
  const orderNumber = escapeHtml(order.orderNumber);
  const customerName = escapeHtml(`${order.customerFirstName} ${order.customerLastName}`.trim());
  const customerEmail = escapeHtml(order.customerEmail);
  const customerPhone = escapeHtml(order.customerPhone?.trim() || "—");
  const adminUrl = `${order.siteUrl}/admin/commandes/${order.orderId}`;

  const contentHtml = `
    <p style="margin:0 0 8px;font-size:13px;color:#71717a;">Nouvelle commande payée</p>
    <p style="margin:0 0 20px;font-size:20px;font-weight:600;color:#18181b;">${orderNumber}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr><td style="padding:4px 0;color:#71717a;width:120px;">Client</td><td style="padding:4px 0;color:#18181b;">${customerName}</td></tr>
      <tr><td style="padding:4px 0;color:#71717a;">E-mail</td><td style="padding:4px 0;"><a href="mailto:${customerEmail}" style="color:#18181b;">${customerEmail}</a></td></tr>
      <tr><td style="padding:4px 0;color:#71717a;">Téléphone</td><td style="padding:4px 0;color:#18181b;">${customerPhone}</td></tr>
    </table>
    ${buildOrderItemsTableHtml(order)}
    ${emailInfoBox("Point relais", formatRelayPointHtml(order.relayPoint))}
    <p style="margin:20px 0 0;"><a href="${escapeHtml(adminUrl)}" style="color:#18181b;font-weight:600;">Ouvrir la commande dans l'administration →</a></p>
  `.trim();

  const subject = `[${order.shopName}] Nouvelle commande ${order.orderNumber}`;

  const text = [
    `Nouvelle commande payée : ${order.orderNumber}`,
    "",
    `Client : ${order.customerFirstName} ${order.customerLastName}`,
    `E-mail : ${order.customerEmail}`,
    `Téléphone : ${order.customerPhone ?? "—"}`,
    "",
    "Articles :",
    formatOrderItemsText(order),
    "",
    formatOrderTotalsText(order),
    "",
    `Point relais : ${formatRelayPointText(order.relayPoint)}`,
    "",
    `Administration : ${adminUrl}`,
  ].join("\n");

  return {
    subject,
    text,
    html: wrapEmailLayout({
      shopName: order.shopName,
      siteUrl: order.siteUrl,
      previewText: `Nouvelle commande ${order.orderNumber}`,
      contentHtml,
    }),
  };
}
