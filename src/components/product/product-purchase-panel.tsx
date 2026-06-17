"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { Check, PackageCheck, Ruler, ShoppingBag } from "lucide-react";

import { ProductBadgeList } from "@/components/product/product-badges";
import { ProductCardPrice } from "@/components/product/product-card-price";
import { ProductCompactSizeGuide } from "@/components/product/product-compact-size-guide";
import {
  ProductDefectNotice,
  ProductSellabilityNotice,
} from "@/components/product/product-sellability-notice";
import { ProductRatingStars } from "@/components/product/product-rating-stars";
import { ProductShippingRecap } from "@/components/product/product-shipping-recap";
import {
  ProductVariantPicker,
  variantDisplayLabel,
} from "@/components/product/product-variant-picker";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { useToast } from "@/hooks/use-toast";
import { useConsultedSizesStore } from "@/lib/favorites/consulted-sizes-store";
import { useCartStore } from "@/lib/cart/store";
import {
  isProductCuratedSelection,
  resolveProductConditionSummary,
} from "@/lib/catalog/product-page-content";
import {
  extractDocumentedDefects,
  isLikelySecondHandProduct,
  isProductStorefrontSellable,
} from "@/lib/catalog/product-sellability";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductDetail } from "@/types/catalog";

interface ProductPurchasePanelProps {
  product: ProductDetail;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const sellable = isProductStorefrontSellable(product.images);
  const defects = extractDocumentedDefects(product.images);
  const secondHand = isLikelySecondHandProduct(
    [product.description, product.shortDescription].filter(Boolean).join(" "),
  );
  const curatedSelection = isProductCuratedSelection({
    badges: product.badges,
    description: product.description,
    shortDescription: product.shortDescription,
  });
  const conditionSummary = resolveProductConditionSummary({
    secondHand,
    curatedSelection,
    defects,
    material: product.material,
  });

  const trackConsultedSize = useConsultedSizesStore((state) => state.track);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    sellable ? (product.variants.find((v) => v.stockQuantity > 0)?.id ?? null) : null,
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

  const canPurchase =
    sellable && selectedVariant != null && selectedVariant.stockQuantity > 0 && !added;

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = product.variants.find((item) => item.id === variantId);
    const label = variant?.sizeLabel?.trim() || variant?.ageLabel?.trim();
    if (variant && label) {
      trackConsultedSize({
        productSlug: product.slug,
        productName: product.name,
        label,
      });
    }
  };

  useEffect(() => {
    if (!sellable || !selectedVariantId) return;
    const variant = product.variants.find((item) => item.id === selectedVariantId);
    const label = variant?.sizeLabel?.trim() || variant?.ageLabel?.trim();
    if (variant && label) {
      trackConsultedSize({
        productSlug: product.slug,
        productName: product.name,
        label,
      });
    }
    // Enregistre la taille pré-sélectionnée au chargement de la fiche.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois par montage produit
  }, [product.slug]);

  const handleAddToCart = () => {
    if (!sellable) {
      toast.warning(
        "Bientôt disponible",
        "Cet article sera activé à l'achat dès que les photos seront publiées.",
      );
      return;
    }

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

    toast.success(
      "Ajouté au panier",
      `${product.name} — ${variantDisplayLabel(selectedVariant)}`,
    );
    openDrawer();
  };

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:gap-5 lg:self-start">
      {product.badges.length > 0 ? (
        <ProductBadgeList badges={product.badges} max={2} storefrontCard />
      ) : null}

      <header className="space-y-2">
        {product.categoryName && product.categorySlug ? (
          <Link
            href={`/categorie/${product.categorySlug}`}
            className="text-retail-label text-tilouki-pistache bg-tilouki-pistache-soft/60 inline-flex rounded-full px-2.5 py-0.5"
          >
            {product.categoryName}
          </Link>
        ) : product.categoryName ? (
          <p className="text-retail-label text-tilouki-teal-dark">
            {product.categoryName}
          </p>
        ) : null}
        <h1 className="text-product-title">{product.name}</h1>
        {(product.ratingCount ?? 0) > 0 ? (
          <ProductRatingStars
            average={product.ratingAverage}
            count={product.ratingCount}
            size="md"
          />
        ) : null}
      </header>

      <ProductCardPrice
        priceCents={displayPrice}
        compareAtPriceCents={comparePrice}
        className="[&_span:first-child]:text-2xl [&_span:first-child]:sm:text-[1.75rem]"
      />

      <ProductSellabilityNotice
        sellable={sellable}
        slug={product.slug}
        images={product.images}
      />

      <ProductDefectNotice
        defects={defects}
        secondHand={secondHand}
        curatedSelection={curatedSelection && !secondHand}
        conditionTitle={conditionSummary?.title}
        conditionIntro={conditionSummary?.intro}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p id="variant-size-label" className="text-sm font-semibold">
            Choisir la taille
          </p>
          <Link
            href="#size-guide"
            className="text-tilouki-teal-dark inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            <Ruler className="size-3.5" aria-hidden />
            Conseil taille
          </Link>
        </div>

        <ProductVariantPicker
          variants={product.variants}
          selectedVariantId={selectedVariantId}
          onSelect={handleVariantSelect}
          disabled={!sellable}
        />

        <ProductCompactSizeGuide
          selectedVariant={selectedVariant}
          sizes={product.sizes}
          ageLabels={product.ageLabels}
          gender={product.gender}
          material={product.material}
          secondHand={secondHand}
        />

        {selectedVariant ? (
          <div className="flex items-center gap-2 text-sm">
            <PackageCheck
              className={cn(
                "size-4 shrink-0",
                selectedVariant.stockQuantity > 0
                  ? "text-tilouki-teal-dark"
                  : "text-destructive",
              )}
              aria-hidden
            />
            {selectedVariant.stockQuantity <= 3 && selectedVariant.stockQuantity > 0 ? (
              <span className="rounded-full bg-amber-100/90 px-2 py-0.5 text-xs font-semibold text-amber-950">
                Plus que {selectedVariant.stockQuantity} en stock
              </span>
            ) : selectedVariant.stockQuantity > 0 ? (
              <span className="text-tilouki-teal-dark font-medium">
                En stock — expédié sous 48 h
              </span>
            ) : (
              <span className="text-destructive font-medium">
                Rupture sur cette taille
              </span>
            )}
          </div>
        ) : sellable && product.variants.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            Sélectionnez une taille pour voir la disponibilité.
          </p>
        ) : null}
      </div>

      <ProductShippingRecap variant="cta" />

      <div className="hidden flex-col gap-2.5 lg:flex">
        <Button
          size="lg"
          className={cn(
            "min-h-12 w-full text-base font-semibold shadow-[var(--shadow-soft)] transition-all duration-[var(--transition-base)]",
            added && "bg-tilouki-sage-dark hover:bg-tilouki-sage-dark/90",
            !sellable && "opacity-80",
          )}
          onClick={handleAddToCart}
          disabled={!canPurchase}
          aria-disabled={!sellable || !canPurchase}
        >
          {added ? (
            <Check className="animate-in zoom-in-50 size-4 duration-200" aria-hidden />
          ) : (
            <ShoppingBag className="size-4" aria-hidden />
          )}
          {!sellable
            ? "Bientôt disponible"
            : added
              ? "Ajouté au panier"
              : "Ajouter au panier"}
        </Button>
        {sellable ? (
          <ButtonLink href="/panier" variant="outline" size="lg" className="min-h-11">
            Voir le panier
          </ButtonLink>
        ) : null}
      </div>

      {sellable ? (
        <>
          <div
            className="bg-card/95 border-border/80 fixed inset-x-0 bottom-[calc(var(--cookie-banner-height,0px)+var(--mobile-bottom-nav-height,0px))] z-40 border-t px-3 py-2 shadow-[0_-4px_24px_oklch(0.28_0.02_50_/_0.08)] backdrop-blur-md lg:hidden"
            aria-label="Ajouter au panier"
          >
            <div className="mx-auto flex max-w-lg items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-lg leading-none font-bold tabular-nums">
                  {formatPrice(displayPrice)}
                </p>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {selectedVariant
                    ? variantDisplayLabel(selectedVariant)
                    : "Choisissez une taille"}
                </p>
              </div>
              <Button
                size="lg"
                className={cn(
                  "min-h-11 min-w-[7.5rem] shrink-0 px-4 font-semibold",
                  added && "bg-tilouki-sage-dark hover:bg-tilouki-sage-dark/90",
                )}
                onClick={handleAddToCart}
                disabled={!canPurchase}
              >
                {added ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <ShoppingBag className="size-4" aria-hidden />
                )}
                {added ? "Ajouté" : "Ajouter"}
              </Button>
            </div>
          </div>
          <div className="h-[4.5rem] shrink-0 lg:hidden" aria-hidden />
        </>
      ) : null}
    </div>
  );
}
