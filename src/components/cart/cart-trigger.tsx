"use client";

import { ShoppingBag } from "lucide-react";

import { CartBadge } from "@/components/cart/cart-badge";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart/store";

export function CartTrigger() {
  const openDrawer = useCartStore((s) => s.openDrawer);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative shrink-0"
        aria-label="Ouvrir le panier"
        onClick={openDrawer}
      >
        <ShoppingBag className="size-5" />
        <CartBadge />
      </Button>
      <CartDrawer />
    </>
  );
}
