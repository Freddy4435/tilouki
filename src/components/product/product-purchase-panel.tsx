"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Check, MapPin, PackageCheck, ShoppingBag, ShieldCheck } from "lucide-react";

import { ProductBadgeList } from "@/components/product/product-badges";
import { SizeAgeBadge } from "@/components/product/size-age-badge";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
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
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    setAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2200);

    toast.success("Ajouté au panier", `${product.name} — ${variantLabel(selectedVariant)}`);
    openDrawer();
  };

  return (
    <div className="flex flex-col gap-6">
      {product.badges.length > 0 ? <ProductBadgeList badges={product.badges} /> : null}

      <header>
        {product.categoryName && product.categorySlug ? (
          <Link
            href={`/categorie/${product.categorySlug}`}
            className="text-tilouki-sage-dark bg-tilouki-sage-light/60 mb-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
          >
            {product.categoryName}
          </Link>
        ) : product.categoryName ? (
          <p className="text-tilouki-sage-dark mb-2 text-xs font-semibold uppercase tracking-wide">
            {product.categoryName}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm font-medium">{product.brandLabel}</p>
        )}
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
        <span className="text-3xl font-bold tabular-nums tracking-tight">
          {formatPrice(displayPrice)}
        </span>
        {comparePrice != null && comparePrice > displayPrice ? (
          <span className="text-muted-foreground text-lg line-through tabular-nums">
            {formatPrice(comparePrice)}
          </span>
        ) : null}
      </div>

      <dl className="grid gap-3 rounded-xl border border-tilouki-blue/10 bg-gradient-to-br from-tilouki-blue-soft/25 to-tilouki-sage-light/20 p-4 text-sm sm:grid-cols-2">
        {product.material ? (
          <div>
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Matière
            </dt>
            <dd className="mt-0.5 font-medium">{product.material}</dd>
          </div>
        ) : null}
        {product.season ? (
          <div>
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Saison
            </dt>
            <dd className="mt-0.5 font-medium">{product.season}</dd>
          </div>
        ) : null}
        {product.madeIn ? (
          <div>
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Origine
            </dt>
            <dd className="mt-0.5 font-medium">{product.madeIn}</dd>
          </div>
        ) : null}
      </dl>

      <div>
        <p className="mb-3 text-sm font-semibold">Choisir la taille / l&apos;âge</p>
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
                    "min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                    isSelected &&
                      "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]",
                    !isSelected &&
                      !outOfStock &&
                      "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
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
          <div className="mt-3 flex items-center gap-2 text-sm">
            <PackageCheck
              className={cn(
                "size-4 shrink-0",
                selectedVariant.stockQuantity > 0
                  ? "text-tilouki-sage-dark"
                  : "text-destructive",
              )}
              aria-hidden
            />
            {selectedVariant.stockQuantity <= 3 && selectedVariant.stockQuantity > 0 ? (
              <span className="text-amber-800 font-medium">
                Stock disponible — plus que {selectedVariant.stockQuantity} exemplaire
                {selectedVariant.stockQuantity > 1 ? "s" : ""}
              </span>
            ) : selectedVariant.stockQuantity > 0 ? (
              <span className="text-tilouki-sage-dark font-medium">Stock disponible</span>
            ) : (
              <span className="text-destructive font-medium">Rupture de stock</span>
            )}
          </div>
        ) : null}
      </div>

      <div className="hidden flex-col gap-3 lg:flex lg:flex-row">
        <Button
          size="lg"
          className={cn(
            "min-h-11 flex-1 rounded-full transition-all duration-[var(--transition-base)]",
            added && "bg-tilouki-sage-dark hover:bg-tilouki-sage-dark/90",
          )}
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stockQuantity <= 0 || added}
        >
          {added ? (
            <Check className="size-4 animate-in zoom-in-50 duration-200" aria-hidden />
          ) : (
            <ShoppingBag className="size-4" aria-hidden />
          )}
          {added ? "Ajouté !" : "Ajouter au panier"}
        </Button>
        <ButtonLink
          href="/panier"
          variant="outline"
          size="lg"
          className="min-h-11 rounded-full"
        >
          Voir le panier
        </ButtonLink>
      </div>

      {/* Barre d'achat collante mobile */}
      <div
        className="bg-card/95 fixed inset-x-0 bottom-[var(--cookie-banner-height,0px)] z-40 border-t border-border/80 p-3 shadow-[0_-8px_32px_oklch(0.28_0.02_50_/_0.1)] backdrop-blur-md lg:hidden"
        aria-label="Ajouter au panier"
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-semibold">{product.name}</p>
            <p className="text-primary text-lg font-bold tabular-nums">{formatPrice(displayPrice)}</p>
          </div>
          <Button
            size="lg"
            className={cn(
              "min-h-11 shrink-0 rounded-full px-5",
              added && "bg-tilouki-sage-dark hover:bg-tilouki-sage-dark/90",
            )}
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stockQuantity <= 0 || added}
          >
            {added ? <Check className="size-4" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
            {added ? "Ajouté" : "Ajouter"}
          </Button>
        </div>
      </div>

      <div className="bg-card space-y-3 rounded-xl border p-4 shadow-[var(--shadow-soft)]">
        <ReassuranceStrip variant="stack" />
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <MapPin className="text-primary size-3.5" aria-hidden />
            Expédié depuis la France
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="text-primary size-3.5" aria-hidden />
            Paiement sécurisé
          </span>
        </div>
      </div>

      {product.ageLabels.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Âges :</span>
          {product.ageLabels.map((label) => (
            <SizeAgeBadge key={label} label={label} variant="age" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
