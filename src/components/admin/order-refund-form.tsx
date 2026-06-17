"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { createOrderRefundAction } from "@/server/actions/admin/refund";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";

interface OrderRefundFormProps {
  order: Pick<
    AdminOrderDetail,
    "id" | "orderNumber" | "paymentStatus" | "stripePaymentIntentId" | "totalCents"
  >;
}

export function OrderRefundForm({ order }: OrderRefundFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [amountEuros, setAmountEuros] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (order.paymentStatus !== "paid" || !order.stripePaymentIntentId) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const amountCents =
      mode === "partial"
        ? Math.round(Number.parseFloat(amountEuros.replace(",", ".")) * 100)
        : undefined;

    if (mode === "partial" && (!amountCents || Number.isNaN(amountCents) || amountCents <= 0)) {
      setError("Montant partiel invalide.");
      return;
    }

    const confirmLabel =
      mode === "full"
        ? `Rembourser intégralement la commande ${order.orderNumber} (${formatPrice(order.totalCents)}) ?`
        : `Rembourser ${formatPrice(amountCents!)} sur ${formatPrice(order.totalCents)} ?`;

    if (!confirm(confirmLabel)) return;

    startTransition(async () => {
      const result = await createOrderRefundAction({
        orderId: order.id,
        mode,
        amountCents,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage(result.message ?? "Remboursement initié.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
      <p className="text-sm font-medium">Remboursement Stripe</p>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Le webhook Stripe met à jour le statut et restaure le stock en cas de remboursement
        intégral. Un remboursement partiel envoie uniquement l&apos;e-mail client.
      </p>

      <fieldset className="space-y-2">
        <legend className="sr-only">Type de remboursement</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="refund-mode"
            checked={mode === "full"}
            onChange={() => setMode("full")}
          />
          Intégral ({formatPrice(order.totalCents)})
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="refund-mode"
            checked={mode === "partial"}
            onChange={() => setMode("partial")}
          />
          Partiel
        </label>
      </fieldset>

      {mode === "partial" ? (
        <div className="space-y-1">
          <Label htmlFor={`refund-amount-${order.id}`}>Montant TTC (€)</Label>
          <Input
            id={`refund-amount-${order.id}`}
            type="text"
            inputMode="decimal"
            placeholder="Ex. 12,50"
            value={amountEuros}
            onChange={(e) => setAmountEuros(e.target.value)}
            required
          />
        </div>
      ) : null}

      <Button type="submit" variant="destructive" size="sm" disabled={isPending}>
        {isPending ? "Remboursement…" : "Initier le remboursement"}
      </Button>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
