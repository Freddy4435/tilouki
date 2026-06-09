"use client";

import { createContext, useContext } from "react";

import type { ShopSettings } from "@/lib/shop/types";

const ShopContext = createContext<ShopSettings | null>(null);

interface ShopProviderProps {
  settings: ShopSettings;
  children: React.ReactNode;
}

export function ShopProvider({ settings, children }: ShopProviderProps) {
  return <ShopContext.Provider value={settings}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopSettings {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop doit être utilisé dans un ShopProvider.");
  }
  return context;
}
