"use client";

import { AlertCircle, Info } from "lucide-react";

import { getLineStockIssue } from "@/lib/cart/calculations";
import type { CartLineItem } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

interface CartAlertsProps {
  items: CartLineItem[];
  validationMessages: string[];
  error?: string | null;
  isValidating?: boolean;
  className?: string;
}

function lineIssueMessage(item: CartLineItem): string | null {
  if (item.stockQuantity <= 0) {
    return `« ${item.productName} » est en rupture de stock.`;
  }
  if (item.quantity > item.stockQuantity) {
    return `Stock limité pour « ${item.productName} » : ${item.stockQuantity} disponible(s).`;
  }
  return null;
}

export function CartAlerts({
  items,
  validationMessages,
  error,
  isValidating,
  className,
}: CartAlertsProps) {
  const localMessages = items
    .filter((item) => getLineStockIssue(item))
    .map((item) => lineIssueMessage(item))
    .filter((message): message is string => Boolean(message));

  const messages = [...new Set([...validationMessages, ...localMessages])];

  if (!error && messages.length === 0 && !isValidating) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {isValidating ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Info className="size-4 shrink-0" />
          Vérification du stock en cours…
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive flex gap-2 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {messages.map((message) => (
        <div
          key={message}
          role="alert"
          className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{message}</p>
        </div>
      ))}
    </div>
  );
}
