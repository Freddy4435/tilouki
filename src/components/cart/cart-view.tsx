"use client";

import { CartAlerts } from "@/components/cart/cart-alerts";
import { CartEmptyState } from "@/components/cart/cart-empty-state";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { useCartStore } from "@/lib/cart/store";
import type { ProductListItem } from "@/types/catalog";

interface CartViewProps {
  recommendations?: ProductListItem[];
}

export function CartView({ recommendations }: CartViewProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const validationMessages = useCartStore((s) => s.validationMessages);
  const { isValidating, error } = useCartValidation();

  if (items.length === 0) {
    return <CartEmptyState recommendations={recommendations} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <CartAlerts
          items={items}
          validationMessages={validationMessages}
          error={error}
          isValidating={isValidating}
        />

        <div className="space-y-4">
          {items.map((item) => (
            <CartLineItem
              key={item.variantId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
      </div>

      <CartSummary variant="page" />
    </div>
  );
}
