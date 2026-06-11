"use client";

import { Clock } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import type { CarrierInfo, CarrierName } from "@/lib/shipping/types";
import type { CarrierQuote } from "@/hooks/use-cart-shipping";
import { cn } from "@/lib/utils";

interface CarrierSelectorProps {
  carriers: CarrierInfo[];
  quotes: CarrierQuote[];
  selected: CarrierName;
  onSelect: (carrier: CarrierName) => void;
  isLoading?: boolean;
}

/** Pastille « logo » aux couleurs du transporteur (pas d'asset externe). */
function CarrierLogo({ carrier }: { carrier: CarrierName }) {
  if (carrier === "chronopost") {
    return (
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#143c8c] text-sm font-bold text-white"
      >
        Ch
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#96154a] text-sm font-bold text-[#ffd400]"
    >
      MR
    </span>
  );
}

/**
 * Cards radio de choix du transporteur — affiché uniquement si plusieurs
 * transporteurs sont configurés (sinon comportement mono-transporteur).
 */
export function CarrierSelector({
  carriers,
  quotes,
  selected,
  onSelect,
  isLoading = false,
}: CarrierSelectorProps) {
  if (carriers.length < 2) return null;

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Choisissez votre transporteur</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {carriers.map((info) => {
          const quote = quotes.find((q) => q.carrier === info.id);
          const isSelected = selected === info.id;

          return (
            <label
              key={info.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors",
                isSelected ? "border-primary bg-primary/5" : "hover:border-primary/40",
              )}
            >
              <input
                type="radio"
                name="shipping-carrier"
                value={info.id}
                checked={isSelected}
                onChange={() => onSelect(info.id)}
                className="sr-only"
              />
              <CarrierLogo carrier={info.id} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">{info.label}</span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {isLoading || !quote ? "…" : formatPrice(quote.shippingCents)}
                  </span>
                </span>
                <span className="text-muted-foreground mt-1 block text-xs">
                  {info.methodLabel}
                </span>
                <span className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                  <Clock className="size-3" aria-hidden="true" />
                  {info.estimatedDelay}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
