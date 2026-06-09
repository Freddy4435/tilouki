import {
  buildOrderItemsTableHtml,
  escapeHtml,
  formatOrderItemsText,
  formatOrderTotalsText,
  formatRelayPointHtml,
  formatRelayPointText,
} from "@/lib/email/format";
import { emailButton, emailInfoBox, wrapEmailLayout } from "@/lib/email/templates/layout";
import type { OrderEmailPayload, RenderedEmail } from "@/lib/email/types";

export function renderOrderConfirmationEmail(order: OrderEmailPayload): RenderedEmail {
  const trackingUrl = `${order.siteUrl}/suivi-commande`;
  const firstName = escapeHtml(order.customerFirstName);
  const orderNumber = escapeHtml(order.orderNumber);
  const trackingToken = escapeHtml(order.trackingToken);

  const contentHtml = `
    <p style="margin:0 0 16px;">Bonjour ${firstName},</p>
    <p style="margin:0 0 16px;">Merci pour votre commande. Nous la préparons avec soin.</p>
    <p style="margin:0 0 8px;font-size:13px;color:#71717a;">Numéro de commande</p>
    <p style="margin:0 0 20px;font-size:20px;font-weight:600;color:#18181b;letter-spacing:-0.02em;">${orderNumber}</p>
    ${buildOrderItemsTableHtml(order)}
    ${emailInfoBox("Point relais Mondial Relay", formatRelayPointHtml(order.relayPoint))}
    ${emailInfoBox("Suivi de commande", `<span style="font-family:ui-monospace,monospace;">${trackingToken}</span>`)}
    ${emailButton(trackingUrl, "Suivre ma commande")}
    <p style="margin:0;font-size:13px;color:#71717a;">Le paiement a été traité de manière sécurisée. Aucune donnée de carte bancaire n'est transmise par e-mail.</p>
  `.trim();

  const subject = `Confirmation de commande ${order.orderNumber}`;

  const text = [
    `Bonjour ${order.customerFirstName},`,
    "",
    "Merci pour votre commande sur Tilouki.",
    "",
    `Numéro de commande : ${order.orderNumber}`,
    "",
    "Articles :",
    formatOrderItemsText(order),
    "",
    formatOrderTotalsText(order),
    "",
    `Point relais : ${formatRelayPointText(order.relayPoint)}`,
    "",
    `Suivi : ${order.trackingToken}`,
    `Page de suivi : ${trackingUrl}`,
    "",
    "Le paiement a été traité de manière sécurisée. Aucune donnée de carte bancaire n'est transmise par e-mail.",
    "",
    "À bientôt !",
  ].join("\n");

  return {
    subject,
    text,
    html: wrapEmailLayout({
      shopName: order.shopName,
      siteUrl: order.siteUrl,
      previewText: `Commande ${order.orderNumber} confirmée`,
      contentHtml,
    }),
  };
}
