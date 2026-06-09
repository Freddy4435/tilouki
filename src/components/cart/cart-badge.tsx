"use client";

import { useIsMounted } from "@/hooks/use-is-mounted";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

interface CartBadgeProps {
  className?: string;
}

export function CartBadge({ className }: CartBadgeProps) {
  const mounted = useIsMounted();
  const count = useCartStore((s) => s.itemCount());

  if (!mounted || count === 0) return null;

  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
