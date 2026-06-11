"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatShippingProvider } from "@/lib/shipping/labels";
import { formatPrice } from "@/lib/utils";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";

interface OrderPrepSlipProps {
  order: AdminOrderDetail;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderPrepSlip({ order }: OrderPrepSlipProps) {
  const print = () => {
    const content = document.getElementById(`prep-slip-${order.id}`);
    if (!content) return;

    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Bon de préparation ${order.orderNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin: 0 0 8px; }
            .muted { color: #666; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
            th { background: #f5f5f5; }
            .section { margin-top: 20px; }
            .checkbox { width: 18px; height: 18px; border: 1px solid #333; display: inline-block; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={print}>
        <Printer className="size-4" />
        Imprimer bon de préparation
      </Button>

      <div id={`prep-slip-${order.id}`} className="hidden">
        <h1>Bon de préparation — {order.orderNumber}</h1>
        <p className="muted">Commande du {formatDate(order.createdAt)}</p>

        <div className="section">
          <strong>Client</strong>
          <br />
          {order.customerName}
          <br />
          {order.customerEmail}
          {order.customerPhone ? (
            <>
              <br />
              {order.customerPhone}
            </>
          ) : null}
        </div>

        {order.relayPointName ? (
          <div className="section">
            <strong>
              Point relais {formatShippingProvider(order.shippingProvider)}
            </strong>
            <br />
            {order.relayPointName}
            <br />
            {order.relayPointAddress}
            <br />
            {order.relayPointZip} {order.relayPointCity}
            {order.relayPointCountry ? ` (${order.relayPointCountry})` : ""}
            {order.relayPointId ? (
              <>
                <br />
                ID relais : {order.relayPointId}
              </>
            ) : null}
            {order.totalWeightGrams != null ? (
              <>
                <br />
                Poids colis : {order.totalWeightGrams} g
              </>
            ) : null}
            <br />
            Livraison : {formatPrice(order.shippingCents)}
            {order.shippingRateLabel ? ` (${order.shippingRateLabel})` : ""}
          </div>
        ) : null}

        <table>
          <thead>
            <tr>
              <th>✓</th>
              <th>Produit</th>
              <th>Taille / Âge</th>
              <th>SKU</th>
              <th>Qté</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td><span className="checkbox" /></td>
                <td>{item.productName}</td>
                <td>{[item.sizeLabel, item.ageLabel].filter(Boolean).join(" · ") || "—"}</td>
                <td>{item.sku}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="section">
          <strong>Total commande :</strong> {formatPrice(order.totalCents)}
        </div>

        {order.internalNotes ? (
          <div className="section">
            <strong>Notes internes</strong>
            <br />
            {order.internalNotes}
          </div>
        ) : null}
      </div>
    </>
  );
}
