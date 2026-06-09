import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { ProductBadgeList, type ProductBadgeType } from "@/components/product/product-badges";
import { SizeAgeBadgeList } from "@/components/product/size-age-badge";
import { cn, formatPrice } from "@/lib/utils";

export interface ProductCardProps {
  slug: string;
  name: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  imageUrl?: string | null;
  imageAlt?: string;
  sizes?: string[];
  ageLabel?: string;
  badges?: ProductBadgeType[];
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  slug,
  name,
  priceCents,
  compareAtPriceCents,
  imageUrl,
  imageAlt,
  sizes = [],
  ageLabel,
  badges = [],
  priority = false,
  className,
}: ProductCardProps) {
  const href = `/produit/${slug}`;
  const hasDiscount =
    compareAtPriceCents != null && compareAtPriceCents > priceCents;

  return (
    <article
      className={cn(
        "group flex flex-col gap-3 transition-[transform,opacity] duration-[var(--transition-base)]",
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="product-image-frame shadow-[var(--shadow-soft)] transition-shadow duration-[var(--transition-base)] group-hover:shadow-[var(--shadow-card-hover)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
              <ImageIcon className="size-8 opacity-40" aria-hidden />
              <span className="text-xs">Photo à venir</span>
            </div>
          )}

          {badges.length > 0 ? (
            <div className="absolute top-2.5 left-2.5 z-10">
              <ProductBadgeList badges={badges} max={2} />
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-col gap-2 px-0.5">
        <Link href={href} className="group/title">
          <h3 className="text-foreground group-hover/title:text-primary line-clamp-2 text-sm leading-snug font-medium transition-colors sm:text-base">
            {name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-semibold tabular-nums">
            {formatPrice(priceCents)}
          </span>
          {hasDiscount ? (
            <span className="text-muted-foreground text-sm line-through tabular-nums">
              {formatPrice(compareAtPriceCents)}
            </span>
          ) : null}
        </div>

        {ageLabel ? (
          <SizeAgeBadgeList items={[ageLabel]} variant="age" max={1} />
        ) : null}

        {sizes.length > 0 ? (
          <SizeAgeBadgeList items={sizes} variant="size" max={4} />
        ) : null}
      </div>
    </article>
  );
}
