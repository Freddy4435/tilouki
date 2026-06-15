"use client";

import { useRef, useState } from "react";
import { Check, Plus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatQuickAddVariantLabel } from "@/lib/catalog/product-card-data";
import { useCartStore } from "@/lib/cart/store";
import type { ProductQuickAddVariant } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface ProductCardQuickAddProps {
  productId: string;
  slug: string;
  productName: string;
  imageUrl?: string | null;
  directVariant: ProductQuickAddVariant;
}

export function ProductCardQuickAdd({
  productId,
  slug,
  productName,
  imageUrl,
  directVariant,
}: ProductCardQuickAddProps) {
  const toast = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    toast.success(
      "Ajouté au panier",
      `${productName} — ${formatQuickAddVariantLabel(directVariant)}`,
    );
    openDrawer();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addVariant();
  };

  return (
    <div
      className="pointer-events-none absolute right-2 bottom-2 z-20 hidden md:block"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Button
        type="button"
        size="icon"
        className={cn(
          buttonVariants({ size: "icon" }),
          "pointer-events-auto size-10 rounded-full shadow-[var(--shadow-card)] ring-1 ring-black/[0.06] transition-[transform,opacity,box-shadow] duration-200 md:translate-y-1 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100",
          added
            ? "bg-tilouki-sage hover:bg-tilouki-sage text-white"
            : "bg-card text-foreground hover:bg-card",
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
