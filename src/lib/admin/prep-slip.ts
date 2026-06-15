import { escapeHtml } from "@/lib/email/format";
import { formatShippingProvider } from "@/lib/shipping/labels";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";
import { formatPrice } from "@/lib/utils";

export const PREP_SLIP_STYLES = `
  body { font-family: system-ui, sans-serif; padding: 24px; color: #111; margin: 0; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  .muted { color: #666; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; vertical-align: top; }
  th { background: #f5f5f5; }
  .section { margin-top: 20px; font-size: 13px; line-height: 1.5; }
  .checkbox { width: 18px; height: 18px; border: 1px solid #333; display: inline-block; }
  .notes { white-space: pre-wrap; }
`.trim();

function e(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return escapeHtml(String(value));
}

function formatPrepSlipDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVariantLabel(sizeLabel: string | null, ageLabel: string | null): string {
  return [sizeLabel, ageLabel].filter(Boolean).join(" · ") || "—";
}

function buildRelaySection(order: AdminOrderDetail): string {
  if (!order.relayPointName) return "";

  const countrySuffix = order.relayPointCountry
    ? ` (${e(order.relayPointCountry)})`
    : "";

  const lines = [
    `<strong>Point relais ${e(formatShippingProvider(order.shippingProvider))}</strong>`,
    e(order.relayPointName),
    e(order.relayPointAddress),
    `${e(order.relayPointZip)} ${e(order.relayPointCity)}${countrySuffix}`,
  ];

  if (order.relayPointId) {
    lines.push(`ID relais : ${e(order.relayPointId)}`);
  }
  if (order.totalWeightGrams != null) {
    lines.push(`Poids colis : ${e(order.totalWeightGrams)} g`);
  }

  const shippingLabel = order.shippingRateLabel
    ? ` (${e(order.shippingRateLabel)})`
    : "";
  lines.push(`Livraison : ${e(formatPrice(order.shippingCents))}${shippingLabel}`);

  return `<div class="section">${lines.join("<br />")}</div>`;
}

function buildItemsRows(order: AdminOrderDetail): string {
  return order.items
    .map(
      (item) => `<tr>
      <td><span class="checkbox" aria-hidden="true"></span></td>
      <td>${e(item.productName)}</td>
      <td>${e(formatVariantLabel(item.sizeLabel, item.ageLabel))}</td>
      <td>${e(item.sku)}</td>
      <td>${e(item.quantity)}</td>
    </tr>`,
    )
    .join("\n");
}

/** Fragment HTML du bon (champs échappés) — pour affichage dans la page d'impression. */
export function buildPrepSlipBodyHtml(order: AdminOrderDetail): string {
  const phoneLine = order.customerPhone ? `<br />${e(order.customerPhone)}` : "";

  const notesSection = order.internalNotes
    ? `<div class="section"><strong>Notes internes</strong><br /><span class="notes">${e(order.internalNotes)}</span></div>`
    : "";

  return `<article>
    <h1>Bon de préparation — ${e(order.orderNumber)}</h1>
    <p class="muted">Commande du ${e(formatPrepSlipDate(order.createdAt))}</p>

    <div class="section">
      <strong>Client</strong><br />
      ${e(order.customerName)}<br />
      ${e(order.customerEmail)}${phoneLine}
    </div>

    ${buildRelaySection(order)}

    <table>
      <thead>
        <tr>
          <th scope="col">✓</th>
          <th scope="col">Produit</th>
          <th scope="col">Taille / Âge</th>
          <th scope="col">SKU</th>
          <th scope="col">Qté</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsRows(order)}
      </tbody>
    </table>

    <div class="section">
      <strong>Total commande :</strong> ${e(formatPrice(order.totalCents))}
    </div>

    ${notesSection}
  </article>`;
}

/** Document HTML complet du bon de préparation — champs client échappés. */
export function buildPrepSlipHtml(order: AdminOrderDetail): string {
  const body = buildPrepSlipBodyHtml(order);

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bon de préparation ${e(order.orderNumber)}</title>
    <style>${PREP_SLIP_STYLES}</style>
  </head>
  <body>${body}</body>
</html>`;
}
