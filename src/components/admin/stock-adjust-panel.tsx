"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adjustStockAction,
  lookupVariantBySkuAction,
} from "@/server/actions/admin/stock";
import type { AdminStockItem } from "@/lib/supabase/queries/admin/stock";

interface StockAdjustPanelProps {
  presetVariant?: AdminStockItem | null;
}

export function StockAdjustPanel({ presetVariant = null }: StockAdjustPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sku, setSku] = useState(presetVariant?.sku ?? "");
  const [variant, setVariant] = useState<AdminStockItem | null>(presetVariant);
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const lookup = () => {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await lookupVariantBySkuAction(sku);
      if (result.error || !result.variant) {
        setVariant(null);
        setError(result.error ?? "Variante introuvable.");
        return;
      }
      setVariant(result.variant);
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!variant) {
      setError("Recherchez d'abord une variante par SKU.");
      return;
    }

    const parsedDelta = Number.parseInt(delta, 10);
    if (!Number.isFinite(parsedDelta) || parsedDelta === 0) {
      setError("Indiquez une variation entière (+ ou -).");
      return;
    }

    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await adjustStockAction({
        variantId: variant.variantId,
        delta: parsedDelta,
        note,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage(result.message ?? "Stock ajusté.");
      setDelta("");
      setNote("");
      if (result.newStockQuantity != null && variant) {
        setVariant({ ...variant, stockQuantity: result.newStockQuantity });
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] flex-1 space-y-1">
          <Label htmlFor="stock-sku">SKU variante</Label>
          <Input
            id="stock-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Ex. TK-BODY-6M"
          />
        </div>
        <Button type="button" variant="outline" disabled={isPending} onClick={lookup}>
          Rechercher
        </Button>
      </div>

      {variant ? (
        <p className="text-sm">
          <span className="font-medium">{variant.productName}</span>
          {" — "}
          stock actuel :{" "}
          <span className="font-semibold tabular-nums">{variant.stockQuantity}</span>
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="stock-delta">Variation (+ / −)</Label>
          <Input
            id="stock-delta"
            type="number"
            inputMode="numeric"
            placeholder="Ex. 5 ou -2"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="stock-note">Motif</Label>
          <textarea
            id="stock-note"
            rows={2}
            placeholder="Ex. réception fournisseur, inventaire, casse…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending || !variant}>
        {isPending ? "Enregistrement…" : "Ajuster le stock"}
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
