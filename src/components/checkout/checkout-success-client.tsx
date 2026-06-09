"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/cart/store";

interface CheckoutSuccessClientProps {
  isPaid: boolean;
}

export function CheckoutSuccessClient({ isPaid }: CheckoutSuccessClientProps) {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (isPaid) {
      clearCart();
    }
  }, [clearCart, isPaid]);

  return null;
}
