"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { ProductBadgeList } from "@/components/product/product-badges";
import { SizeAgeBadge } from "@/components/product/size-age-badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/cart/store";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductDetail, ProductVariant } from "@/types/catalog";

interface ProductPurchasePanelProps {
  product: ProductDetail;
}

function variantLabel(variant: ProductVariant): string {
  const parts = [variant.sizeLabel, variant.ageLabel, variant.color].filter(Boolean);
  return parts.join(" · ") || variant.sku;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.find((v) => v.stockQuantity > 0)?.id ?? null,
  );

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  const displayPrice = selectedVariant?.priceCents ?? product.minPriceCents;
  const comparePrice =
    selectedVariant?.compareAtPriceCents ?? product.compareAtPriceCents;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.warning("Choisissez une taille", "Sélectionnez une variante disponible.");
      return;
    }

    if (selectedVariant.stockQuantity <= 0) {
      toast.error("Rupture de stock", "Cette taille n'est plus disponible.");
      return;
    }

    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        productName: product.name,
        sizeLabel: selectedVariant.sizeLabel,
        ageLabel: selectedVariant.ageLabel,
        sku: selectedVariant.sku,
        unitPriceCents: selectedVariant.priceCents,
        image: product.primaryImageUrl,
        stockQuantity: selectedVariant.stockQuantity,
        weightGrams: selectedVariant.weightGrams,
      },
      1,
    );

    toast.success("Ajouté au panier", `${product.name} — ${variantLabel(selectedVariant)}`);
    openDrawer();
  };

  return (
    <div className="flex flex-col gap-6">
      {product.badges.length > 0 ? <ProductBadgeList badges={product.badges} /> : null}

      <header>
        <p className="text-muted-foreground text-sm">
          {product.categoryName ?? product.brandLabel}
        </p>
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          {product.name}
        </h1>
        {product.shortDescription ? (
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            {product.shortDescription}
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-semibold tabular-nums">{formatPrice(displayPrice)}</span>
        {comparePrice != null && comparePrice > displayPrice ? (
          <span className="text-muted-foreground text-lg line-through tabular-nums">
            {formatPrice(comparePrice)}
          </span>
        ) : null}
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {product.material ? (
          <div>
            <dt className="text-muted-foreground">Matière</dt>
            <dd className="font-medium">{product.material}</dd>
          </div>
        ) : null}
        {product.season ? (
          <div>
            <dt className="text-muted-foreground">Saison</dt>
            <dd className="font-medium">{product.season}</dd>
          </div>
        ) : null}
        {product.madeIn ? (
          <div>
            <dt className="text-muted-foreground">Origine</dt>
            <dd className="font-medium">{product.madeIn}</dd>
          </div>
        ) : null}
      </dl>

      <div>
        <p className="mb-3 text-sm font-semibold">Taille / âge</p>
        {product.variants.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune variante disponible.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const outOfStock = variant.stockQuantity <= 0;
              const isSelected = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    isSelected && "border-primary bg-primary/10 text-primary",
                    !isSelected && !outOfStock && "hover:border-primary/40",
                    outOfStock && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {variantLabel(variant)}
                </button>
              );
            })}
          </div>
        )}

        {selectedVariant ? (
          <p className="text-muted-foreground mt-3 text-sm">
            {selectedVariant.stockQuantity <= 3 && selectedVariant.stockQuantity > 0 ? (
              <span className="text-destructive font-medium">
                Plus que {selectedVariant.stockQuantity} en stock
              </span>
            ) : selectedVariant.stockQuantity > 0 ? (
              <span className="text-tilouki-sage-dark font-medium">En stock</span>
            ) : (
              <span className="text-destructive font-medium">Rupture de stock</span>
            )}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1 rounded-full"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
        >
          <ShoppingBag className="size-4" />
          Ajouter au panier
        </Button>
        <ButtonLink href="/panier" variant="outline" size="lg" className="rounded-full">
          Voir le panier
        </ButtonLink>
      </div>

      {product.ageLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {product.ageLabels.map((label) => (
            <SizeAgeBadge key={label} label={label} variant="age" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
