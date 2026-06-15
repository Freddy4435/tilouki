"use client";

import { getReassuranceMicrocopy } from "@/lib/constants/reassurance";
import { useShop } from "@/components/providers/shop-provider";
import { cn } from "@/lib/utils";

interface ReassuranceStripProps {
  variant?: "pills" | "compact" | "stack";
  className?: string;
}

export function ReassuranceStrip({
  variant = "pills",
  className,
}: ReassuranceStripProps) {
  const { minShippingCents, returnPolicy } = useShop();
  const items = getReassuranceMicrocopy({
    minShippingCents,
    hasReturnPolicy: Boolean(returnPolicy?.trim()),
  });

  if (variant === "stack") {
    return (
      <ul className={cn("space-y-2.5", className)}>
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5 text-sm">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
              <item.icon className="size-3.5" aria-hidden />
            </span>
            <span className="text-foreground/90 font-medium">{item.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === "compact") {
    return (
      <ul
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium",
          className,
        )}
      >
        {items.map((item) => (
          <li key={item.id} className="text-muted-foreground flex items-center gap-1">
            <item.icon className="text-primary size-3 shrink-0" aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("flex flex-wrap justify-center gap-2 sm:gap-2.5", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="bg-card/80 border-border/60 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-[var(--shadow-soft)] backdrop-blur-sm sm:text-sm"
        >
          <item.icon className="text-primary size-3.5 shrink-0" aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
