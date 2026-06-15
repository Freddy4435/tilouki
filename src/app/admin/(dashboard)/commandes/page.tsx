import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminFilterSelect } from "@/components/admin/admin-filter-select";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { OrderActions } from "@/components/admin/order-actions";
import { OrdersExportButton } from "@/components/admin/orders-export-button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/status-labels";
import { listAdminOrders } from "@/lib/supabase/queries/admin/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Commandes",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminCommandesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status as OrderStatus | undefined;
  const paymentStatus = params.payment as PaymentStatus | undefined;
  const orders = await listAdminOrders({
    query: params.q,
    status,
    paymentStatus,
  });

  const statusOptions = (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(
    (s) => ({
      value: s,
      label: ORDER_STATUS_LABELS[s],
    }),
  );

  const paymentOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map(
    (s) => ({
      value: s,
      label: PAYMENT_STATUS_LABELS[s],
    }),
  );

  return (
    <>
      <AdminPageHeader
        title="Commandes"
        description="Suivez et gérez les commandes clients."
        actions={
          <Suspense>
            <OrdersExportButton />
          </Suspense>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Suspense>
          <AdminSearch placeholder="N° commande, e-mail, nom…" />
        </Suspense>
        <Suspense>
          <AdminFilterSelect
            paramName="status"
            options={statusOptions}
            placeholder="Statut"
          />
        </Suspense>
        <Suspense>
          <AdminFilterSelect
            paramName="payment"
            options={paymentOptions}
            placeholder="Paiement"
            allLabel="Tous les paiements"
          />
        </Suspense>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Point relais</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground h-24 text-center text-sm"
                >
                  Aucune commande pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/commandes/${order.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-muted-foreground text-xs">
                      {order.customerEmail}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(order.totalCents)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[160px] truncate text-sm">
                    {order.relayPointLabel ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      <OrderActions order={order} compact />
                      <ButtonLink
                        href={`/admin/commandes/${order.id}`}
                        variant="link"
                        size="sm"
                      >
                        Détail
                      </ButtonLink>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
