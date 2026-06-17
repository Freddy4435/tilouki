"use client";

import dynamic from "next/dynamic";

import { Toaster } from "@/components/ui/sonner";

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((mod) => mod.CartDrawer),
  { ssr: false },
);

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
