import { escapeHtml, formatRelayPointHtml, formatRelayPointText } from "@/lib/email/format";
import { emailButton, emailInfoBox, wrapEmailLayout } from "@/lib/email/templates/layout";
import type { OrderEmailPayload, RenderedEmail } from "@/lib/email/types";

export function renderShippingConfirmationEmail(order: OrderEmailPayload): RenderedEmail {
  const trackingUrl = `${order.siteUrl}/suivi-commande`;
  const firstName = escapeHtml(order.customerFirstName);
  const orderNumber = escapeHtml(order.orderNumber);
  const trackingToken = escapeHtml(order.trackingToken);
  const carrierName = order.carrierName ?? "Mondial Relay";

  const carrierTrackingLink = order.carrierTrackingUrl
    ? `<p style="margin:8px 0 0;"><a href="${escapeHtml(order.carrierTrackingUrl)}" style="color:#18181b;font-weight:600;">Suivre mon colis ${escapeHtml(carrierName)} →</a></p>`
    : "";

  const carrierTracking = order.trackingNumber
    ? `<p style="margin:0 0 4px;font-size:13px;color:#71717a;">Numéro de suivi transporteur</p>
       <p style="margin:0;font-family:ui-monospace,monospace;font-weight:600;color:#18181b;">${escapeHtml(order.trackingNumber)}</p>${carrierTrackingLink}`
    : `<p style="margin:0;color:#3f3f46;">Votre colis est en route vers le point relais.</p>`;

  const contentHtml = `
    <p style="margin:0 0 16px;">Bonjour ${firstName},</p>
    <p style="margin:0 0 16px;">Bonne nouvelle : votre commande <strong>${orderNumber}</strong> vient d'être expédiée.</p>
    ${emailInfoBox("Expédition", carrierTracking)}
    ${emailInfoBox(`Point relais ${escapeHtml(carrierName)}`, formatRelayPointHtml(order.relayPoint))}
    ${emailInfoBox("Suivi Tilouki", `<span style="font-family:ui-monospace,monospace;">${trackingToken}</span>`)}
    ${emailButton(trackingUrl, "Suivre ma commande")}
    <p style="margin:0;font-size:13px;color:#71717a;">Vous recevrez une notification du transporteur lorsque le colis sera disponible au point relais.</p>
  `.trim();

  const subject = `Votre commande ${order.orderNumber} a été expédiée`;

  const trackingLine = order.trackingNumber
    ? `Numéro de suivi transporteur : ${order.trackingNumber}`
    : "Votre colis est en route vers le point relais.";

  const text = [
    `Bonjour ${order.customerFirstName},`,
    "",
    `Votre commande ${order.orderNumber} vient d'être expédiée.`,
    "",
    trackingLine,
    ...(order.carrierTrackingUrl
      ? [`Suivre mon colis ${carrierName} : ${order.carrierTrackingUrl}`]
      : []),
    "",
    `Point relais : ${formatRelayPointText(order.relayPoint)}`,
    "",
    `Suivi Tilouki : ${order.trackingToken}`,
    `Page de suivi : ${trackingUrl}`,
    "",
    "À bientôt sur Tilouki !",
  ].join("\n");

  return {
    subject,
    text,
    html: wrapEmailLayout({
      shopName: order.shopName,
      siteUrl: order.siteUrl,
      previewText: `Commande ${order.orderNumber} expédiée`,
      contentHtml,
    }),
  };
}
