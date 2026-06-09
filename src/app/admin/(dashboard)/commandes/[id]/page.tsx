import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderActions } from "@/components/admin/order-actions";
import { OrderInternalNotesForm } from "@/components/admin/order-internal-notes-form";
import { OrderPrepSlip } from "@/components/admin/order-prep-slip";
import { OrderStatusHistory } from "@/components/admin/order-status-history";
import { OrderTrackingForm } from "@/components/admin/order-tracking-form";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOrder } from "@/lib/supabase/queries/admin/orders";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminOrder(id);
  return {
    title: order ? `Commande ${order.orderNumber}` : "Commande",
    robots: { index: false, follow: false },
  };
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

export default async function AdminCommandeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const canEditTracking = ["preparing", "shipped"].includes(order.status);

  return (
    <>
      <AdminPageHeader
        title={`Commande ${order.orderNumber}`}
        description={`Passée le ${formatDate(order.createdAt)}`}
        actions={<OrderPrepSlip order={order} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Articles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Taille / Âge</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">Prix unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {[item.sizeLabel, item.ageLabel].filter(Boolean).join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(item.unitPriceCents)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(item.totalPriceCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="tabular-nums">{formatPrice(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className="tabular-nums">{formatPrice(order.shippingCents)}</span>
              </div>
              {order.discountCents > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remise</span>
                  <span className="tabular-nums">-{formatPrice(order.discountCents)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des statuts</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusHistory entries={order.statusHistory} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
              {order.customerPhone ? (
                <p className="text-muted-foreground">{order.customerPhone}</p>
              ) : null}
            </CardContent>
          </Card>

          {order.relayPointName ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Point relais</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{order.relayPointName}</p>
                <p className="text-muted-foreground">{order.relayPointAddress}</p>
                <p className="text-muted-foreground">
                  {[order.relayPointZip, order.relayPointCity].filter(Boolean).join(" ")}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paiement Stripe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Statut : </span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              {order.stripePaymentIntentId ? (
                <p className="text-muted-foreground break-all font-mono text-xs">
                  Payment Intent : {order.stripePaymentIntentId}
                </p>
              ) : null}
              {order.stripeSessionId ? (
                <p className="text-muted-foreground break-all font-mono text-xs">
                  Session : {order.stripeSessionId}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Préparation & suivi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderActions order={order} />
              <OrderTrackingForm
                orderId={order.id}
                trackingNumber={order.trackingNumber}
                disabled={!canEditTracking}
              />
              {!canEditTracking && order.paymentStatus === "paid" ? (
                <p className="text-muted-foreground text-xs">
                  Le numéro de suivi est modifiable en préparation ou après expédition.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes internes</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderInternalNotesForm orderId={order.id} initialNotes={order.internalNotes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
