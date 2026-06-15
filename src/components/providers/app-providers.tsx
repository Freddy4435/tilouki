"use client";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
      <CartDrawer />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
