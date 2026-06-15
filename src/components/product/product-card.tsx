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
  /** Variante compacte pour carrousels mobile (accueil). */
  variant?: "default" | "compact";
  className?: string;
}

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

  const ctaLabel = getProductCardCtaLabel(sizes, quickAddVariants, inStock);
  const hasRating = Boolean(ratingAverage && (ratingCount ?? 0) > 0);
  const showMaterial = Boolean(material?.trim());
  const showColorSwatches = colorOptions.length >= 2;
  const showSizes = sizes.length > 0;

  return (
    <article
      className={cn(
        "tilouki-product-card group bg-card flex h-full flex-col overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04]",
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
          badges={badges}
          priority={priority}
          inStock={inStock}
          selectedColor={selectedColor}
        />
        <FavoriteButton slug={slug} />
        {showQuickAdd && directVariant ? (
          <ProductCardQuickAdd
            productId={productId}
            slug={slug}
            productName={name}
            imageUrl={activeImageUrl}
            directVariant={directVariant}
          />
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          compact ? "gap-1 p-2.5" : "gap-1.5 p-2.5 sm:gap-2 sm:p-3",
        )}
      >
        {!compact && categoryName ? (
          <p className="text-retail-label text-tilouki-ink-muted hidden sm:block">
            {categoryName}
          </p>
        ) : null}

        <Link href={href} className="group/title block">
          <h3
            className={cn(
              "text-foreground group-hover/title:text-primary line-clamp-2 leading-snug font-semibold transition-colors",
              compact ? "text-[13px]" : "text-sm sm:text-[0.9375rem]",
            )}
          >
            {name}
          </h3>
        </Link>

        <ProductCardPrice
          priceCents={priceCents}
          compareAtPriceCents={compareAtPriceCents}
          compact={compact}
        />

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

        {showColorSwatches ? (
          <div className="hidden sm:block">
            <ProductCardColorSwatches
              options={colorOptions}
              selectedColor={selectedColor}
              onSelectColor={selectColor}
            />
          </div>
        ) : null}

        {showSizes ? (
          <div className="hidden space-y-1 sm:block">
            <SizeAgeBadgeList
              items={sizes}
              variant="size"
              max={compact ? 3 : 4}
              density={compact ? "compact" : "default"}
            />
          </div>
        ) : ageLabel ? (
          <div className="hidden sm:block">
            <SizeAgeBadgeList
              items={[ageLabel]}
              variant="age"
              max={1}
              density={compact ? "compact" : "default"}
            />
          </div>
        ) : null}

        {inStock && (isLastPiece || lowStock) ? (
          <p
            className={cn(
              "hidden text-[11px] leading-tight font-medium sm:block",
              isLastPiece ? "text-tilouki-persimmon-dark" : "text-amber-900",
            )}
          >
            {isLastPiece
              ? "Dernière pièce disponible"
              : `Plus que ${totalStock} en stock`}
          </p>
        ) : !inStock ? (
          <p className="text-muted-foreground hidden text-[11px] sm:block">
            Rupture de stock
          </p>
        ) : null}

        <div className={cn("mt-auto pt-0.5", !compact && "md:pt-1")}>
          {compact ? (
            <Link
              href={href}
              className="text-primary hover:text-primary/85 inline-flex min-h-8 w-full items-center justify-center gap-1 text-xs font-semibold transition-colors"
            >
              {ctaLabel}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : (
            <Link
              href={href}
              className={cn(
                "border-border/80 text-foreground hover:border-primary/40 hover:bg-muted/40 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[var(--radius-button)] border bg-transparent text-sm font-semibold transition-[opacity,transform,colors] duration-200",
                "max-md:text-primary max-md:h-8 max-md:border-0 max-md:bg-transparent max-md:text-xs max-md:font-semibold max-md:hover:bg-transparent",
                "md:translate-y-1 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100",
              )}
            >
              {ctaLabel}
              <ArrowRight
                className="max-md:text-primary size-3.5 opacity-70"
                aria-hidden
              />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
