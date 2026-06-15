"use client";

import { ShoppingBag } from "lucide-react";

import { CartBadge } from "@/components/cart/cart-badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart/store";

export function CartTrigger() {
  const openDrawer = useCartStore((s) => s.openDrawer);
  const itemCount = useCartStore((s) => s.itemCount());

  const ariaLabel =
    itemCount > 0
      ? `Ouvrir le panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`
      : "Ouvrir le panier";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative shrink-0"
      aria-label={ariaLabel}
      onClick={openDrawer}
    >
      <ShoppingBag className="size-5" />
      <CartBadge />
    </Button>
  );
}
