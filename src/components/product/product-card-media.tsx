"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ProductBadgeList,
  type ProductBadgeType,
} from "@/components/product/product-badges";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import { shouldShowSecondaryImage } from "@/lib/catalog/product-card-data";
import { isCommercialProductImage } from "@/lib/catalog/product-sellability";
import type { ProductCardColorOption } from "@/types/catalog";
import { cn } from "@/lib/utils";

export type ProductCardMediaVariant = "default" | "compact" | "premium-rail";

interface ProductCardMediaProps {
  href: string;
  name: string;
  primaryImageUrl?: string | null;
  primaryImageAlt?: string;
  secondaryImageUrl?: string | null;
  secondaryImageAlt?: string | null;
  colorOptions?: ProductCardColorOption[];
  badges?: ProductBadgeType[];
  priority?: boolean;
  inStock: boolean;
  selectedColor: string | null;
  variant?: ProductCardMediaVariant;
}

export function ProductCardMedia({
  href,
  name,
  primaryImageUrl,
  primaryImageAlt,
  secondaryImageUrl,
  secondaryImageAlt,
  colorOptions = [],
  badges = [],
  priority = false,
  inStock,
  selectedColor,
  variant = "default",
}: ProductCardMediaProps) {
  const activePrimaryUrl = useMemo(() => {
    if (!selectedColor) return primaryImageUrl ?? null;
    const option = colorOptions.find((item) => item.color === selectedColor);
    return option?.imageUrl ?? primaryImageUrl ?? null;
  }, [colorOptions, primaryImageUrl, selectedColor]);

  const activeSecondaryUrl = useMemo(() => {
    if (selectedColor) return null;
    const url = secondaryImageUrl ?? null;
    if (!url) return null;
    if (!isCommercialProductImage(url, secondaryImageAlt ?? null)) return null;
    return url;
  }, [secondaryImageUrl, secondaryImageAlt, selectedColor]);

  const showSecondary = shouldShowSecondaryImage(activeSecondaryUrl, activePrimaryUrl);

  const hasCommercialMedia = Boolean(
    activePrimaryUrl &&
    isCommercialProductImage(activePrimaryUrl, primaryImageAlt ?? null),
  );

  const isPremiumRail = variant === "premium-rail";
  const imageSizes = isPremiumRail
    ? IMAGE_SIZES.productCardRail
    : IMAGE_SIZES.productCard;

  if (!hasCommercialMedia) {
    return (
      <div
        className={cn(
          "product-image-frame product-card-media rounded-b-none ring-0",
          variant === "compact" && "product-card-media--compact",
          isPremiumRail && "product-card-media--premium-rail",
        )}
        aria-hidden
        data-storefront-hidden="no-commercial-photo"
      >
        <div className="bg-tilouki-jade-soft h-full w-full" />
      </div>
    );
  }

  return (
    <Link href={href} className="block" aria-label={`Voir ${name}`}>
      <div
        className={cn(
          "product-image-frame product-card-media rounded-b-none ring-0",
          variant === "compact" && "product-card-media--compact",
          isPremiumRail && "product-card-media--premium-rail",
        )}
      >
        <div className="absolute inset-0">
          <Image
            src={activePrimaryUrl!}
            alt={primaryImageAlt ?? name}
            fill
            sizes={imageSizes}
            className={cn(
              "object-cover transition-opacity duration-500 ease-out",
              showSecondary && "md:group-hover:opacity-0",
            )}
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>
        {showSecondary && activeSecondaryUrl ? (
          <div className="absolute inset-0 hidden md:block">
            <Image
              src={activeSecondaryUrl}
              alt={secondaryImageAlt ?? `${name} — autre vue`}
              fill
              sizes={imageSizes}
              className="object-cover opacity-0 transition-opacity duration-500 ease-out md:group-hover:opacity-100"
              loading="lazy"
            />
          </div>
        ) : null}

        {badges.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10">
            <ProductBadgeList
              badges={badges}
              max={isPremiumRail ? 2 : 1}
              storefrontCard
              size="card"
              layout="stack"
            />
          </div>
        ) : null}

        {!inStock ? (
          <div className="bg-tilouki-ink/45 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-card/95 text-foreground rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase shadow-sm">
              Rupture
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function useProductCardColorState(colorOptions: ProductCardColorOption[] = []) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const selectColor = (color: string | null) => {
    if (!color) {
      setSelectedColor(null);
      return;
    }

    setSelectedColor((current) => (current === color ? null : color));
  };

  return {
    selectedColor,
    selectColor,
    hasColors: colorOptions.length >= 2,
  };
}
