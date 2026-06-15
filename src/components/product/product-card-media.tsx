"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ProductBadgeList,
  type ProductBadgeType,
} from "@/components/product/product-badges";
import { shouldShowSecondaryImage } from "@/lib/catalog/product-card-data";
import { isCommercialProductImage } from "@/lib/catalog/product-sellability";
import type { ProductCardColorOption } from "@/types/catalog";
import { cn } from "@/lib/utils";

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
}: ProductCardMediaProps) {
  const activePrimaryUrl = useMemo(() => {
    if (!selectedColor) return primaryImageUrl ?? null;
    const option = colorOptions.find((item) => item.color === selectedColor);
    return option?.imageUrl ?? primaryImageUrl ?? null;
  }, [colorOptions, primaryImageUrl, selectedColor]);

  const activeSecondaryUrl = useMemo(() => {
    if (selectedColor) return null;
    return secondaryImageUrl ?? null;
  }, [secondaryImageUrl, selectedColor]);

  const showSecondary = shouldShowSecondaryImage(activeSecondaryUrl, activePrimaryUrl);

  const hasCommercialMedia = Boolean(
    activePrimaryUrl &&
    isCommercialProductImage(activePrimaryUrl, primaryImageAlt ?? null),
  );

  if (!hasCommercialMedia) {
    return (
      <div
        className="product-image-frame product-card-media rounded-b-none ring-0"
        aria-hidden
        data-storefront-hidden="no-commercial-photo"
      >
        <div className="bg-tilouki-jade-soft h-full w-full" />
      </div>
    );
  }

  return (
    <Link href={href} className="block" aria-label={`Voir ${name}`}>
      <div className="product-image-frame product-card-media rounded-b-none ring-0">
        <div className="absolute inset-0">
          <Image
            src={activePrimaryUrl!}
            alt={primaryImageAlt ?? name}
            fill
            sizes="(max-width: 640px) 44vw, (max-width: 1024px) 33vw, 25vw"
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
              sizes="(max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 ease-out md:group-hover:opacity-100"
              loading="lazy"
            />
          </div>
        ) : null}

        {badges.length > 0 ? (
          <div className="pointer-events-none absolute top-1.5 left-1.5 z-10 max-w-[72%]">
            <ProductBadgeList badges={badges} max={2} storefrontCard size="card" />
          </div>
        ) : null}

        {!inStock ? (
          <div className="bg-tilouki-ink/50 absolute inset-0 z-10 flex items-center justify-center">
            <span className="bg-card text-foreground rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
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
