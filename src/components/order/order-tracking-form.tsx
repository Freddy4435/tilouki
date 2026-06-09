"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import type { OrderTrackingInfo } from "@/types/catalog";

interface OrderTrackingFormProps {
  action: (token: string) => Promise<OrderTrackingInfo | null>;
}

export function OrderTrackingForm({ action }: OrderTrackingFormProps) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<OrderTrackingInfo | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(undefined);

    startTransition(async () => {
      try {
        const trimmed = token.trim();
        if (!trimmed) {
          setError("Veuillez saisir votre numéro de suivi.");
          return;
        }
        const order = await action(trimmed);
        setResult(order);
        if (!order) setError("Aucune commande trouvée pour ce numéro de suivi.");
      } catch {
        setError("Impossible de récupérer le suivi. Réessayez plus tard.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="tracking-token" className="text-sm font-medium">
            Numéro de suivi
          </label>
          <Input
            id="tracking-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Reçu par e-mail après commande"
            autoComplete="off"
          />
          <p className="text-muted-foreground text-xs">
            Le numéro de suivi vous est communiqué dans l&apos;e-mail de confirmation.
          </p>
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={isPending}>
          <Search className="size-4" />
          {isPending ? "Recherche…" : "Suivre ma commande"}
        </Button>
      </form>

      {error ? (
        <p className="text-destructive text-center text-sm">{error}</p>
      ) : null}

      {result ? (
        <Card>
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Commande</span>
              <span className="font-medium">{result.orderNumber}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Statut</span>
              <span className="font-medium">{result.status}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium tabular-nums">
                {formatPrice(result.totalCents, result.currency)}
              </span>
            </div>
            {result.trackingNumber ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">N° colis</span>
                <span className="font-medium">{result.trackingNumber}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
