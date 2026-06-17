"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ProductRatingStars } from "@/components/product/product-rating-stars";
import { ProductCardColorSwatches } from "@/components/product/product-card-color-swatches";
import {
  ProductCardMedia,
  useProductCardColorState,
} from "@/components/product/product-card-media";
import { ProductCardQuickAdd } from "@/components/product/product-card-quick-add";
import { ProductCardPrice } from "@/components/product/product-card-price";
import { SizeAgeBadgeList } from "@/components/product/size-age-badge";
import type { ProductBadgeType } from "@/components/product/product-badges";
import { getProductCardCtaLabel } from "@/lib/catalog/product-card-cta";
import {
  canShowProductCardQuickAdd,
  resolveQuickAddMode,
} from "@/lib/catalog/product-card-data";
import { isCommercialProductImage } from "@/lib/catalog/product-sellability";
import type { ProductCardColorOption, ProductQuickAddVariant } from "@/types/catalog";
import { cn } from "@/lib/utils";

export type ProductCardVariant = "default" | "compact" | "premium-rail";

export interface ProductCardProps {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl?: string | null;
  imageAlt?: string;
  secondaryImageUrl?: string | null;
  secondaryImageAlt?: string | null;
  colorOptions?: ProductCardColorOption[];
  quickAddVariants?: ProductQuickAddVariant[];
  categoryName?: string | null;
  material?: string | null;
  sizes?: string[];
  ageLabel?: string;
  badges?: ProductBadgeType[];
  totalStock?: number;
  ratingAverage?: number | null;
  ratingCount?: number;
  priority?: boolean;
  /** compact = catalogue dense ; premium-rail = carrousels home. */
  variant?: ProductCardVariant;
  className?: string;
}

const CARD_ACTION_CLASS =
  "border-border/80 text-foreground hover:border-primary/50 hover:bg-primary/5 inline-flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-button)] border bg-card font-semibold transition-colors";

export function ProductCard({
  productId,
  slug,
  name,
  priceCents,
  compareAtPriceCents,
  imageUrl,
  imageAlt,
  secondaryImageUrl,
  secondaryImageAlt,
  colorOptions = [],
  quickAddVariants = [],
  categoryName,
  material,
  sizes = [],
  ageLabel,
  badges = [],
  totalStock,
  ratingAverage,
  ratingCount,
  priority = false,
  variant = "default",
  className,
}: ProductCardProps) {
  const href = `/produit/${slug}`;
  const compact = variant === "compact";
  const premiumRail = variant === "premium-rail";
  const inStock = totalStock === undefined || totalStock > 0;
  const isLastPiece = totalStock === 1;
  const lowStock = totalStock !== undefined && totalStock > 1 && totalStock <= 3;
  const { selectedColor, selectColor } = useProductCardColorState(colorOptions);

  const isStorefrontSellable = Boolean(
    imageUrl && isCommercialProductImage(imageUrl, imageAlt ?? null),
  );

  const activeImageUrl =
    (selectedColor
      ? colorOptions.find((option) => option.color === selectedColor)?.imageUrl
      : null) ??
    imageUrl ??
    null;

  const showQuickAdd = canShowProductCardQuickAdd({
    quickAddVariants,
    inStock,
    isStorefrontSellable,
  });
  const directVariant = showQuickAdd
    ? resolveQuickAddMode(quickAddVariants).directVariant
    : undefined;

  const inStockVariantCount = quickAddVariants.filter(
    (variantItem) => variantItem.stockQuantity > 0,
  ).length;
  const needsSizeChoice = sizes.length > 1 || inStockVariantCount > 1;

  const ctaLabel = !isStorefrontSellable
    ? "Photos bientôt"
    : getProductCardCtaLabel(sizes, quickAddVariants, inStock);
  const hasRating = Boolean(ratingAverage && (ratingCount ?? 0) > 0);
  const showMaterial = Boolean(material?.trim());
  const showColorSwatches = colorOptions.length >= 2;
  const showSizes = sizes.length > 0;
  const sizeBadgeMax = compact ? 3 : premiumRail ? 4 : 4;
  const mediaVariant = compact ? "compact" : premiumRail ? "premium-rail" : "default";

  const stockHint =
    inStock && isLastPiece
      ? "Dernière pièce"
      : inStock && lowStock
        ? `${totalStock} restants`
        : null;

  const cardBadges =
    stockHint != null ? badges.filter((badge) => badge !== "last-piece") : badges;

  return (
    <article
      className={cn(
        "tilouki-product-card group bg-card flex h-full flex-col overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-card)] ring-1 ring-[var(--tilouki-border-subtle)]",
        compact && "tilouki-product-card--compact",
        premiumRail && "tilouki-product-card--premium-rail",
        className,
      )}
    >
      <div className="relative shrink-0">
        <ProductCardMedia
          href={href}
          name={name}
          primaryImageUrl={imageUrl}
          primaryImageAlt={imageAlt}
          secondaryImageUrl={secondaryImageUrl}
          secondaryImageAlt={secondaryImageAlt}
          colorOptions={colorOptions}
          badges={cardBadges}
          priority={priority}
          inStock={inStock}
          selectedColor={selectedColor}
          variant={mediaVariant}
        />
        <FavoriteButton slug={slug} className="top-2 right-2" />
        {showQuickAdd && directVariant && premiumRail ? (
          <ProductCardQuickAdd
            productId={productId}
            slug={slug}
            productName={name}
            imageUrl={activeImageUrl}
            directVariant={directVariant}
            layout="icon"
            premium
          />
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          compact ? "gap-1.5 p-2" : premiumRail ? "gap-2 p-3" : "gap-2 p-2.5 sm:p-3",
        )}
      >
        {(premiumRail || (!compact && categoryName)) && categoryName ? (
          <p
            className={cn(
              "text-retail-label text-tilouki-ink-muted truncate",
              compact ? "hidden" : premiumRail ? "block" : "hidden sm:block",
            )}
          >
            {categoryName}
          </p>
        ) : null}

        <Link href={href} className="group/title block min-w-0">
          <h3
            className={cn(
              "text-foreground group-hover/title:text-primary line-clamp-2 leading-snug font-semibold transition-colors",
              compact
                ? "min-h-[2.5rem] text-[13px] leading-[1.25rem]"
                : premiumRail
                  ? "min-h-[2.75rem] text-sm"
                  : "min-h-[2.6rem] text-sm sm:text-[0.9375rem]",
            )}
          >
            {name}
          </h3>
        </Link>

        <div className="flex min-w-0 items-start justify-between gap-2">
          <ProductCardPrice
            priceCents={priceCents}
            compareAtPriceCents={compareAtPriceCents}
            compact={compact}
            premium={premiumRail}
            className="min-w-0 flex-1"
          />
          {stockHint && inStock ? (
            <p
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] leading-tight font-semibold tracking-wide",
                isLastPiece
                  ? "bg-tilouki-persimmon-dark/10 text-tilouki-persimmon-dark"
                  : "bg-tilouki-vanille-soft text-tilouki-navy",
              )}
            >
              {stockHint}
            </p>
          ) : null}
        </div>

        {showSizes ? (
          <SizeAgeBadgeList
            items={sizes}
            variant="size"
            max={sizeBadgeMax}
            density={compact || premiumRail ? "compact" : "default"}
            layout={compact ? "inline" : "wrap"}
            className="min-h-6"
          />
        ) : ageLabel ? (
          <SizeAgeBadgeList
            items={[ageLabel]}
            variant="age"
            max={1}
            density={compact ? "compact" : "default"}
            layout="inline"
            className="min-h-6"
          />
        ) : (
          <div className={cn(compact ? "min-h-6" : "min-h-0")} aria-hidden />
        )}

        {!compact && (showMaterial || hasRating) ? (
          <div className="hidden min-h-[1.125rem] sm:block">
            {showMaterial ? (
              <p className="text-muted-foreground line-clamp-1 text-[11px] leading-tight">
                {material}
              </p>
            ) : (
              <ProductRatingStars
                average={ratingAverage}
                count={ratingCount}
                size="sm"
              />
            )}
          </div>
        ) : null}

        {showColorSwatches && !compact ? (
          <div className="hidden sm:block">
            <ProductCardColorSwatches
              options={colorOptions}
              selectedColor={selectedColor}
              onSelectColor={selectColor}
            />
          </div>
        ) : null}

        <div className="product-card-cta mt-auto pt-1">
          {showQuickAdd && directVariant && !premiumRail ? (
            <ProductCardQuickAdd
              productId={productId}
              slug={slug}
              productName={name}
              imageUrl={activeImageUrl}
              directVariant={directVariant}
              layout="bar"
              compact={compact}
              premium={premiumRail}
            />
          ) : (
            <Link
              href={href}
              className={cn(
                CARD_ACTION_CLASS,
                compact
                  ? "min-h-10 text-xs"
                  : premiumRail
                    ? "min-h-11 text-sm"
                    : "min-h-10 text-sm",
                needsSizeChoice &&
                  inStock &&
                  isStorefrontSellable &&
                  "border-primary/25 bg-primary/5 text-primary",
                !isStorefrontSellable &&
                  "border-muted-foreground/25 bg-muted/30 text-muted-foreground pointer-events-none",
              )}
              aria-disabled={!isStorefrontSellable}
            >
              {ctaLabel}
              <ArrowRight className="size-3.5 shrink-0 opacity-80" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
