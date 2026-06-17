"use client";

import { useRef, useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatQuickAddVariantLabel } from "@/lib/catalog/product-card-data";
import { trackRetailEvent } from "@/lib/analytics/retail-events";
import { useCartStore } from "@/lib/cart/store";
import type { ProductQuickAddVariant } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface ProductCardQuickAddProps {
  productId: string;
  slug: string;
  productName: string;
  imageUrl?: string | null;
  directVariant: ProductQuickAddVariant;
  layout?: "icon" | "bar";
  compact?: boolean;
  premium?: boolean;
  className?: string;
}

export function ProductCardQuickAdd({
  productId,
  slug,
  productName,
  imageUrl,
  directVariant,
  layout = "bar",
  compact = false,
  premium = false,
  className,
}: ProductCardQuickAddProps) {
  const toast = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const variantLabel = formatQuickAddVariantLabel(directVariant);

  const addVariant = () => {
    addItem(
      {
        variantId: directVariant.id,
        productId,
        slug,
        productName,
        sizeLabel: directVariant.sizeLabel,
        ageLabel: directVariant.ageLabel,
        sku: directVariant.sku,
        unitPriceCents: directVariant.priceCents,
        image: imageUrl ?? null,
        stockQuantity: directVariant.stockQuantity,
        weightGrams: directVariant.weightGrams,
      },
      1,
    );

    setAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 1800);

    trackRetailEvent("add_to_cart", {
      product_slug: slug,
      product_name: productName,
      value_cents: directVariant.priceCents,
      source: "quick_add",
    });

    toast.success("Ajouté au panier", `${productName} — ${variantLabel}`);
    openDrawer();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addVariant();
  };

  if (layout === "icon") {
    return (
      <div
        className={cn("pointer-events-none absolute right-2 bottom-2 z-20", className)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <Button
          type="button"
          size="icon"
          className={cn(
            "pointer-events-auto size-10 rounded-full shadow-[var(--shadow-card)] ring-1 ring-black/[0.06]",
            added
              ? "bg-tilouki-sage hover:bg-tilouki-sage text-white"
              : "bg-card/95 text-foreground hover:bg-card backdrop-blur-sm",
          )}
          aria-label={added ? "Ajouté au panier" : `Ajout rapide — ${productName}`}
          onClick={handleClick}
        >
          {added ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      className={cn(
        "w-full gap-1.5 font-semibold shadow-[var(--shadow-soft)]",
        compact
          ? "min-h-10 text-xs"
          : premium
            ? "min-h-11 text-sm"
            : "min-h-10 text-sm",
        added && "bg-tilouki-sage hover:bg-tilouki-sage text-white",
        className,
      )}
      aria-label={
        added
          ? "Ajouté au panier"
          : `Ajouter au panier — ${productName}, ${variantLabel}`
      }
      onClick={handleClick}
    >
      {added ? (
        <>
          Ajouté
          <Check className="size-3.5" aria-hidden />
        </>
      ) : (
        <>
          <ShoppingBag className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">Ajouter — {variantLabel}</span>
        </>
      )}
    </Button>
  );
}
