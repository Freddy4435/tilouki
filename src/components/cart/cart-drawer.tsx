"use client";

import { CartAlerts } from "@/components/cart/cart-alerts";
import { CartEmptyState } from "@/components/cart/cart-empty-state";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useCartStore } from "@/lib/cart/store";

export function CartDrawer() {
  const mounted = useIsMounted();
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const validationMessages = useCartStore((s) => s.validationMessages);
  const { isValidating, error } = useCartValidation({
    enabled: isOpen && items.length > 0,
  });

  if (!mounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Panier{itemCount > 0 ? ` (${itemCount})` : ""}</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Aucun article pour le moment."
              : "Vérifiez vos articles avant de commander."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 overflow-y-auto px-1 py-4">
              <CartEmptyState compact />
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto px-1 py-4">
                <CartAlerts
                  items={items}
                  validationMessages={validationMessages}
                  error={error}
                  isValidating={isValidating}
                />
                <div className="divide-y">
                  {items.map((item) => (
                    <CartLineItem
                      key={item.variantId}
                      item={item}
                      compact
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-background sticky bottom-0 shrink-0 border-t shadow-[0_-4px_24px_oklch(0.28_0.02_50_/_0.06)]">
                <div className="p-4">
                  <CartSummary variant="drawer" onContinueShopping={closeDrawer} />
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
