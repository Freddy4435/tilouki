"use client";

import { CartAlerts } from "@/components/cart/cart-alerts";
import { CartComplementSection } from "@/components/cart/cart-complement-section";
import { CartEmptyState } from "@/components/cart/cart-empty-state";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { RecentlyViewedSection } from "@/components/recently-viewed/recently-viewed-section";
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

  const cartSlugs = items.map((item) => item.slug).filter(Boolean);

  return (
    <div className="space-y-12">
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

      <CartComplementSection cartSlugs={cartSlugs} />

      <RecentlyViewedSection
        excludeSlugs={cartSlugs}
        description="Reprenez les articles consultés avant de finaliser votre commande."
        className="border-t pt-10"
      />
    </div>
  );
}
