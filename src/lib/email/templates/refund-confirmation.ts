import { escapeHtml, formatOrderTotalsText } from "@/lib/email/format";
import { emailInfoBox, wrapEmailLayout } from "@/lib/email/templates/layout";
import type { OrderEmailPayload, RenderedEmail } from "@/lib/email/types";

export interface RefundEmailOptions {
  partial?: boolean;
  refundedCents?: number;
}

function formatRefundedAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function renderRefundConfirmationEmail(
  order: OrderEmailPayload,
  options?: RefundEmailOptions,
): RenderedEmail {
  const firstName = escapeHtml(order.customerFirstName);
  const orderNumber = escapeHtml(order.orderNumber);
  const totalsText = formatOrderTotalsText(order).replace(/\n/g, "<br/>");
  const isPartial = options?.partial === true;
  const refundedLabel =
    options?.refundedCents != null
      ? formatRefundedAmount(options.refundedCents, order.currency)
      : null;

  const refundSentence = isPartial
    ? `Un remboursement partiel a été effectué sur votre commande <strong>${orderNumber}</strong>.`
    : `Votre commande <strong>${orderNumber}</strong> a été remboursée intégralement.`;

  const amountBox = refundedLabel
    ? emailInfoBox("Montant remboursé", escapeHtml(refundedLabel))
    : emailInfoBox("Montant remboursé", totalsText);

  const contentHtml = `
    <p style="margin:0 0 16px;">Bonjour ${firstName},</p>
    <p style="margin:0 0 16px;">${refundSentence}</p>
    ${amountBox}
    <p style="margin:0;font-size:13px;color:#71717a;">Le remboursement apparaîtra sur votre relevé bancaire sous quelques jours ouvrés, selon votre établissement. Pour toute question, répondez à cet e-mail ou contactez-nous.</p>
  `.trim();

  const subject = isPartial
    ? `Remboursement partiel — commande ${order.orderNumber}`
    : `Remboursement confirmé — commande ${order.orderNumber}`;

  const textRefundLine = isPartial
    ? `Un remboursement partiel a été effectué sur votre commande ${order.orderNumber}.`
    : `Votre commande ${order.orderNumber} a été remboursée intégralement.`;

  const text = [
    `Bonjour ${order.customerFirstName},`,
    "",
    textRefundLine,
    "",
    refundedLabel ?? formatOrderTotalsText(order),
    "",
    "Le remboursement apparaîtra sur votre relevé sous quelques jours ouvrés.",
  ].join("\n");

  return {
    subject,
    text,
    html: wrapEmailLayout({
      shopName: order.shopName,
      siteUrl: order.siteUrl,
      previewText: `Remboursement de la commande ${order.orderNumber}`,
      contentHtml,
    }),
  };
}
