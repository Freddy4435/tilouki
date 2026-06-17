import Image from "next/image";
import Link from "next/link";

import {
  ProductBadgeList,
  filterStorefrontCardBadges,
  type ProductBadgeType,
} from "@/components/product/product-badges";
import { ProductCardPrice } from "@/components/product/product-card-price";
import { SizeAgeBadgeList } from "@/components/product/size-age-badge";
import { isCommercialProductImage } from "@/lib/catalog/product-sellability";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import { cn } from "@/lib/utils";

export interface ProductCardRailProps {
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl?: string | null;
  imageAlt?: string;
  categoryName?: string | null;
  sizes?: string[];
  ageLabel?: string;
  badges?: ProductBadgeType[];
  totalStock?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Carte produit légère (RSC) pour carrousels home — pas de quick-add ni favoris.
 * Réduit le JS hydraté sur l'accueil (TBT / score Lighthouse mobile).
 */
export function ProductCardRail({
  slug,
  name,
  priceCents,
  compareAtPriceCents,
  imageUrl,
  imageAlt,
  categoryName,
  sizes = [],
  ageLabel,
  badges = [],
  totalStock,
  priority = false,
  className,
}: ProductCardRailProps) {
  const href = `/produit/${slug}`;
  const inStock = totalStock === undefined || totalStock > 0;
  const isLastPiece = totalStock === 1;
  const lowStock = totalStock !== undefined && totalStock > 1 && totalStock <= 3;
  const sellable = Boolean(
    imageUrl && isCommercialProductImage(imageUrl, imageAlt ?? null),
  );

  const stockHint =
    inStock && isLastPiece
      ? "Dernière pièce"
      : inStock && lowStock
        ? `${totalStock} restants`
        : null;

  const cardBadges =
    stockHint != null ? badges.filter((badge) => badge !== "last-piece") : badges;
  const visibleBadges = filterStorefrontCardBadges(cardBadges, 2);

  return (
    <article
      className={cn(
        "tilouki-product-card tilouki-product-card--premium-rail group bg-card flex h-full w-[10.75rem] shrink-0 flex-col overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-card)] ring-1 ring-[var(--tilouki-border-subtle)] sm:w-auto",
        className,
      )}
    >
      <Link href={href} className="relative block shrink-0">
        <div className="bg-tilouki-cloud/35 relative aspect-[4/5] overflow-hidden">
          {sellable && imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes={IMAGE_SIZES.productCardRail}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center px-3 text-center text-xs font-medium">
              Photo à venir
            </div>
          )}
          {visibleBadges.length > 0 ? (
            <ProductBadgeList
              badges={visibleBadges}
              storefrontCard
              size="card"
              layout="stack"
              className="absolute top-2 left-2 z-[1] max-w-[calc(100%-0.75rem)]"
            />
          ) : null}
          {stockHint ? (
            <span className="bg-tilouki-persimmon-dark/95 absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              {stockHint}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        {categoryName ? (
          <p className="text-retail-label text-tilouki-ink-muted truncate">
            {categoryName}
          </p>
        ) : null}
        <Link href={href} className="block min-w-0">
          <h3 className="text-foreground line-clamp-2 min-h-[2.75rem] text-sm leading-snug font-semibold">
            {name}
          </h3>
        </Link>
        <ProductCardPrice
          priceCents={priceCents}
          compareAtPriceCents={compareAtPriceCents}
          compact
          premium
        />
        {sizes.length > 0 ? (
          <SizeAgeBadgeList items={sizes} max={4} density="compact" layout="inline" />
        ) : ageLabel ? (
          <SizeAgeBadgeList
            items={[ageLabel]}
            variant="age"
            max={1}
            density="compact"
            layout="inline"
          />
        ) : null}
      </div>
    </article>
  );
}
