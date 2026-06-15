import {
  buildOrderItemsTableHtml,
  escapeHtml,
  formatOrderItemsText,
  formatOrderTotalsText,
  formatRelayPointHtml,
  formatRelayPointText,
} from "@/lib/email/format";
import {
  emailButton,
  emailInfoBox,
  wrapEmailLayout,
} from "@/lib/email/templates/layout";
import type { OrderEmailPayload, RenderedEmail } from "@/lib/email/types";

export function renderOrderConfirmationEmail(order: OrderEmailPayload): RenderedEmail {
  const trackingUrl = `${order.siteUrl}/suivi-commande`;
  const firstName = escapeHtml(order.customerFirstName);
  const orderNumber = escapeHtml(order.orderNumber);
  const trackingToken = escapeHtml(order.trackingToken);
  const carrierName = escapeHtml(order.carrierName ?? "Mondial Relay");

  const contentHtml = `
    <p style="margin:0 0 16px;">Bonjour ${firstName},</p>
    <p style="margin:0 0 16px;">Votre paiement est confirmé. Nous préparons votre commande avec soin.</p>
    <p style="margin:0 0 8px;font-size:13px;color:#71717a;">Numéro de commande</p>
    <p style="margin:0 0 20px;font-size:20px;font-weight:600;color:#18181b;letter-spacing:-0.02em;">${orderNumber}</p>
    ${buildOrderItemsTableHtml(order)}
    ${emailInfoBox(`Point relais ${carrierName}`, formatRelayPointHtml(order.relayPoint))}
    ${emailInfoBox("Code de suivi Tilouki", `<span style="font-family:ui-monospace,monospace;">${trackingToken}</span><p style="margin:8px 0 0;font-size:13px;color:#71717a;">Conservez ce code pour suivre votre commande à tout moment.</p>`)}
    ${emailButton(trackingUrl, "Suivre ma commande")}
    <p style="margin:16px 0 0;font-size:14px;color:#3f3f46;">Prochaine étape : vous recevrez un e-mail dès l'expédition de votre colis vers le point relais.</p>
    <p style="margin:12px 0 0;font-size:13px;color:#71717a;">Paiement sécurisé via Stripe. Aucune donnée de carte bancaire n'est transmise par e-mail.</p>
  `.trim();

  const subject = `Confirmation de commande ${order.orderNumber}`;

  const text = [
    `Bonjour ${order.customerFirstName},`,
    "",
    "Votre paiement est confirmé. Nous préparons votre commande.",
    "",
    `Numéro de commande : ${order.orderNumber}`,
    "",
    "Articles :",
    formatOrderItemsText(order),
    "",
    formatOrderTotalsText(order),
    "",
    `Point relais ${order.carrierName ?? "Mondial Relay"} : ${formatRelayPointText(order.relayPoint)}`,
    "",
    `Code de suivi Tilouki : ${order.trackingToken}`,
    `Page de suivi : ${trackingUrl}`,
    "",
    "Prochaine étape : vous recevrez un e-mail dès l'expédition de votre colis.",
    "",
    "Paiement sécurisé via Stripe. Aucune donnée de carte bancaire n'est transmise par e-mail.",
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
