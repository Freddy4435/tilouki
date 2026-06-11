"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  computeItemCount,
  computeShippingCents,
  computeSubtotalCents,
  computeTotalCents,
  hasStockIssues,
} from "@/lib/cart/calculations";
import type { CartLineInput, CartLineItem, CartValidationResult } from "@/lib/cart/types";
import type { CarrierName } from "@/lib/shipping/types";

interface CartState {
  items: CartLineItem[];
  /** Transporteur choisi à l'étape livraison — Mondial Relay par défaut. */
  carrier: CarrierName;
  isDrawerOpen: boolean;
  validationMessages: string[];
  isValidated: boolean;
  setCarrier: (carrier: CarrierName) => void;
  addItem: (item: CartLineInput, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  applyValidation: (result: CartValidationResult) => void;
  clearValidation: () => void;
  itemCount: () => number;
  subtotalCents: () => number;
  shippingCents: () => number;
  totalCents: () => number;
  canCheckout: () => boolean;
}

function clampQuantity(quantity: number, stockQuantity: number): number {
  if (stockQuantity <= 0) return 0;
  return Math.max(1, Math.min(quantity, stockQuantity));
}

function mergeLineItem(existing: CartLineItem, incoming: CartLineInput, quantity: number): CartLineItem {
  const stockQuantity = Math.max(existing.stockQuantity, incoming.stockQuantity);
  const nextQuantity = clampQuantity(existing.quantity + quantity, stockQuantity);

  return {
    ...existing,
    productName: incoming.productName,
    slug: incoming.slug,
    image: incoming.image ?? existing.image,
    sizeLabel: incoming.sizeLabel,
    ageLabel: incoming.ageLabel,
    sku: incoming.sku,
    unitPriceCents: incoming.unitPriceCents,
    stockQuantity,
    weightGrams: incoming.weightGrams ?? existing.weightGrams,
    quantity: nextQuantity,
  };
}

type LegacyCartLine = {
  variantId: string;
  productId: string;
  productName: string;
  productSlug?: string;
  slug?: string;
  imageUrl?: string | null;
  image?: string | null;
  sizeLabel: string | null;
  ageLabel: string | null;
  sku?: string;
  priceCents?: number;
  unitPriceCents?: number;
  quantity: number;
  maxStock?: number;
  stockQuantity?: number;
  weightGrams?: number | null;
};

function migratePersistedCart(persisted: unknown): Pick<CartState, "items"> {
  const state = persisted as { items?: LegacyCartLine[] };
  const items = (state.items ?? []).map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    slug: item.slug ?? item.productSlug ?? "",
    image: item.image ?? item.imageUrl ?? null,
    sizeLabel: item.sizeLabel,
    ageLabel: item.ageLabel,
    sku: item.sku ?? "",
    unitPriceCents: item.unitPriceCents ?? item.priceCents ?? 0,
    quantity: item.quantity,
    stockQuantity: item.stockQuantity ?? item.maxStock ?? 0,
    weightGrams: item.weightGrams ?? null,
  }));

  return { items };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      carrier: "mondial_relay",
      isDrawerOpen: false,
      validationMessages: [],
      isValidated: false,

      setCarrier: (carrier) => set({ carrier }),

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? mergeLineItem(i, item, quantity) : i,
              ),
              isValidated: false,
              validationMessages: [],
            };
          }

          const stockQuantity = item.stockQuantity;
          if (stockQuantity <= 0) return state;

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: clampQuantity(quantity, stockQuantity),
              },
            ],
            isValidated: false,
            validationMessages: [],
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
          isValidated: false,
          validationMessages: [],
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: clampQuantity(quantity, i.stockQuantity) }
              : i,
          ),
          isValidated: false,
          validationMessages: [],
        }));
      },

      clearCart: () =>
        set({
          items: [],
          validationMessages: [],
          isValidated: false,
        }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      applyValidation: (result) => {
        set((state) => {
          const byVariant = new Map(result.items.map((line) => [line.variantId, line]));
          const nextItems: CartLineItem[] = [];

          for (const item of state.items) {
            const validated = byVariant.get(item.variantId);
            if (!validated || !validated.isAvailable || validated.adjustedQuantity <= 0) {
              continue;
            }

            nextItems.push({
              ...item,
              unitPriceCents: validated.unitPriceCents,
              stockQuantity: validated.stockQuantity,
              quantity: validated.adjustedQuantity,
            });
          }

          const itemsUnchanged =
            nextItems.length === state.items.length &&
            nextItems.every((item, index) => {
              const current = state.items[index];
              return (
                current &&
                item.variantId === current.variantId &&
                item.quantity === current.quantity &&
                item.stockQuantity === current.stockQuantity &&
                item.unitPriceCents === current.unitPriceCents
              );
            });
          const messagesUnchanged =
            result.messages.length === state.validationMessages.length &&
            result.messages.every((message, index) => message === state.validationMessages[index]);

          if (itemsUnchanged && messagesUnchanged && state.isValidated === result.valid) {
            return state;
          }

          return {
            items: nextItems,
            validationMessages: result.messages,
            isValidated: result.valid,
          };
        });
      },

      clearValidation: () => set({ validationMessages: [], isValidated: false }),

      itemCount: () => computeItemCount(get().items),
      subtotalCents: () => computeSubtotalCents(get().items),
      shippingCents: () => computeShippingCents(get().items),
      totalCents: () => computeTotalCents(get().items),
      canCheckout: () => get().items.length > 0 && !hasStockIssues(get().items),
    }),
    {
      name: "tilouki-cart",
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) {
          return migratePersistedCart(persisted);
        }
        return persisted as Pick<CartState, "items" | "carrier">;
      },
      partialize: (state) => ({ items: state.items, carrier: state.carrier }),
    },
  ),
);
