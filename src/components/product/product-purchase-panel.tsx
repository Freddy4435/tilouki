"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Check, PackageCheck, Ruler, ShoppingBag } from "lucide-react";

import { ProductBadgeList } from "@/components/product/product-badges";
import { ProductCardPrice } from "@/components/product/product-card-price";
import { ProductCuratorPick } from "@/components/product/product-curator-pick";
import {
  ProductDefectNotice,
  ProductSellabilityNotice,
} from "@/components/product/product-sellability-notice";
import { ProductFacts } from "@/components/product/product-facts";
import { ProductRatingStars } from "@/components/product/product-rating-stars";
import { ProductShippingRecap } from "@/components/product/product-shipping-recap";
import {
  ProductVariantPicker,
  variantDisplayLabel,
} from "@/components/product/product-variant-picker";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/cart/store";
import {
  isProductCuratedSelection,
  resolveContextualSizeAdvice,
  resolveProductCuratorContent,
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
  const curatorContent = useMemo(
    () => resolveProductCuratorContent(product.description, product.shortDescription),
    [product.description, product.shortDescription],
  );
  const conditionSummary = resolveProductConditionSummary({
    secondHand,
    curatedSelection,
    defects,
    material: product.material,
  });
  const sizeAdvice = resolveContextualSizeAdvice({
    sizes: product.sizes,
    ageLabels: product.ageLabels,
    gender: product.gender,
    material: product.material,
    secondHand,
  });

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

  const showShortDescription =
    product.shortDescription?.trim() &&
    product.shortDescription.trim() !== curatorContent?.note;

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:gap-6 lg:self-start">
      {product.badges.length > 0 ? (
        <ProductBadgeList badges={product.badges} max={2} storefrontCard />
      ) : null}

      <header>
        {product.categoryName && product.categorySlug ? (
          <Link
            href={`/categorie/${product.categorySlug}`}
            className="text-retail-label text-tilouki-teal-dark bg-tilouki-jade-soft/60 mb-2 inline-flex rounded-full px-2.5 py-0.5"
          >
            {product.categoryName}
          </Link>
        ) : product.categoryName ? (
          <p className="text-retail-label text-tilouki-teal-dark mb-2">
            {product.categoryName}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm font-medium">
            {product.brandLabel}
          </p>
        )}
        <h1 className="text-product-title mt-1">{product.name}</h1>
        <ProductRatingStars
          average={product.ratingAverage}
          count={product.ratingCount}
          size="md"
          className="mt-2"
        />
        {showShortDescription ? (
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
            {product.shortDescription}
          </p>
        ) : null}
      </header>

      {curatorContent ? <ProductCuratorPick note={curatorContent.note} /> : null}

      <ProductCardPrice
        priceCents={displayPrice}
        compareAtPriceCents={comparePrice}
        className="[&>span:first-child]:text-2xl [&>span:first-child]:sm:text-3xl"
      />

      <ProductSellabilityNotice sellable={sellable} />

      <ProductFacts product={product} />

      <ProductDefectNotice
        defects={defects}
        secondHand={secondHand}
        curatedSelection={curatedSelection && !secondHand}
        conditionTitle={conditionSummary?.title}
        conditionIntro={conditionSummary?.intro}
      />

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p id="variant-size-label" className="text-sm font-semibold">
            Taille / âge
          </p>
          <Link
            href="#size-guide"
            className="text-tilouki-teal-dark inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            <Ruler className="size-3.5" aria-hidden />
            Guide des tailles
          </Link>
        </div>

        <ProductVariantPicker
          variants={product.variants}
          selectedVariantId={selectedVariantId}
          onSelect={setSelectedVariantId}
          disabled={!sellable}
        />

        <p className="text-muted-foreground mt-3 text-xs leading-relaxed sm:text-sm">
          {sizeAdvice}
        </p>

        {selectedVariant ? (
          <div className="mt-3 flex items-center gap-2 text-sm">
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
              <span className="font-medium text-amber-900">
                Plus que {selectedVariant.stockQuantity} exemplaire
                {selectedVariant.stockQuantity > 1 ? "s" : ""} en stock
              </span>
            ) : selectedVariant.stockQuantity > 0 ? (
              <span className="text-tilouki-teal-dark font-medium">
                En stock — expédition sous 48 h
              </span>
            ) : (
              <span className="text-destructive font-medium">Rupture de stock</span>
            )}
          </div>
        ) : sellable && product.variants.length > 0 ? (
          <p className="text-muted-foreground mt-3 text-sm">
            Sélectionnez une taille pour voir la disponibilité.
          </p>
        ) : null}
      </div>

      <ProductShippingRecap variant="cta" />

      <div className="hidden flex-col gap-3 lg:flex">
        <Button
          size="lg"
          className={cn(
            "min-h-12 w-full text-base font-semibold shadow-[var(--shadow-soft)] transition-all duration-[var(--transition-base)]",
            added && "bg-tilouki-sage-dark hover:bg-tilouki-sage-dark/90",
          )}
          onClick={handleAddToCart}
          disabled={!canPurchase}
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
        <div
          className="bg-card/95 border-border/80 fixed inset-x-0 bottom-[calc(var(--cookie-banner-height,0px)+var(--mobile-bottom-nav-height,0px))] z-40 border-t p-3 shadow-[0_-8px_32px_oklch(0.28_0.02_50_/_0.1)] backdrop-blur-md lg:hidden"
          aria-label="Ajouter au panier"
        >
          <ProductShippingRecap
            variant="cta"
            className="mb-2.5 border-0 bg-transparent p-0"
          />
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-semibold">
                {product.name}
              </p>
              <p className="text-foreground text-lg font-bold tabular-nums">
                {formatPrice(displayPrice)}
              </p>
            </div>
            <Button
              size="lg"
              className={cn(
                "min-h-11 shrink-0 px-5 font-semibold",
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
      ) : null}
    </div>
  );
}
