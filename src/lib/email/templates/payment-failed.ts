import { escapeHtml, formatOrderTotalsText } from "@/lib/email/format";
import {
  emailButton,
  emailInfoBox,
  wrapEmailLayout,
} from "@/lib/email/templates/layout";
import type { OrderEmailPayload, RenderedEmail } from "@/lib/email/types";

export function renderPaymentFailedEmail(
  order: OrderEmailPayload,
  options?: { reason?: string | null },
): RenderedEmail {
  const checkoutUrl = `${order.siteUrl}/commande`;
  const firstName = escapeHtml(order.customerFirstName);
  const orderNumber = escapeHtml(order.orderNumber);
  const reason = options?.reason?.trim();

  const reasonBlock = reason
    ? `<p style="margin:0 0 16px;font-size:14px;color:#71717a;">Motif indiqué : ${escapeHtml(reason)}</p>`
    : "";

  const totalsText = formatOrderTotalsText(order).replace(/\n/g, "<br/>");

  const contentHtml = `
    <p style="margin:0 0 16px;">Bonjour ${firstName},</p>
    <p style="margin:0 0 16px;">Le paiement de votre commande <strong>${orderNumber}</strong> n'a pas pu être finalisé.</p>
    ${emailInfoBox("Montant de la commande", totalsText)}
    ${reasonBlock}
    <p style="margin:0 0 16px;">Aucun montant n'a été débité sur votre compte. Le stock réservé pour cette tentative a été libéré.</p>
    <p style="margin:0 0 16px;">Vous pouvez reprendre votre commande depuis le panier ou le checkout.</p>
    ${emailButton(checkoutUrl, "Reprendre ma commande")}
    <p style="margin:0;font-size:13px;color:#71717a;">Si le problème persiste, contactez votre banque ou notre service client. Aucune donnée de carte bancaire n'est transmise par e-mail.</p>
  `.trim();

  const subject = `Paiement non abouti — commande ${order.orderNumber}`;

  const text = [
    `Bonjour ${order.customerFirstName},`,
    "",
    `Le paiement de votre commande ${order.orderNumber} n'a pas pu être finalisé.`,
    reason ? `Motif : ${reason}` : "",
    "",
    formatOrderTotalsText(order),
    "",
    "Aucun montant n'a été débité. Le stock réservé a été libéré.",
    "Vous pouvez réessayer sur :",
    checkoutUrl,
    "",
    "Si le problème persiste, contactez votre banque ou notre service client.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    text,
    html: wrapEmailLayout({
      shopName: order.shopName,
      siteUrl: order.siteUrl,
      previewText: `Paiement non abouti pour la commande ${order.orderNumber}`,
      contentHtml,
    }),
  };
}
