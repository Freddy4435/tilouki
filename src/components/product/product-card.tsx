import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon, PackageCheck } from "lucide-react";

import { ProductBadgeList, type ProductBadgeType } from "@/components/product/product-badges";
import { SizeAgeBadgeList } from "@/components/product/size-age-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { cn, formatPrice } from "@/lib/utils";

export interface ProductCardProps {
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

export function ProductCard({
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
}: ProductCardProps) {
  const href = `/produit/${slug}`;
  const hasDiscount =
    compareAtPriceCents != null && compareAtPriceCents > priceCents;
  const inStock = totalStock === undefined || totalStock > 0;
  const lowStock = totalStock !== undefined && totalStock > 0 && totalStock <= 3;

  return (
    <article
      className={cn(
        "tilouki-product-card group flex h-full flex-col rounded-2xl bg-card/50 p-1.5 ring-1 ring-black/[0.03] sm:p-2",
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="product-image-frame shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-all duration-[var(--transition-base)] group-hover:shadow-[var(--shadow-card-hover)] group-hover:ring-tilouki-blue/20">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 bg-tilouki-blue-soft/40">
              <ImageIcon className="size-8 opacity-40" aria-hidden />
              <span className="text-xs">Photo à venir</span>
            </div>
          )}

          {badges.length > 0 ? (
            <div className="absolute top-2 left-2 z-10">
              <ProductBadgeList badges={badges} max={2} />
            </div>
          ) : null}

          {categoryName ? (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-card/95 text-tilouki-sage-dark inline-block max-w-[7rem] truncate rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm sm:max-w-none sm:text-[11px]">
                {categoryName}
              </span>
            </div>
          ) : null}

          {inStock ? (
            <div className="absolute bottom-2 left-2 z-10">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-sm sm:text-xs",
                  lowStock
                    ? "bg-primary/95 text-primary-foreground"
                    : "bg-tilouki-sage-light/95 text-tilouki-sage-dark",
                )}
              >
                <PackageCheck className="size-3" aria-hidden />
                {lowStock ? "Dernières pièces" : "En stock"}
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 px-0.5 pt-2.5 sm:px-1 sm:pt-3">
        <Link href={href} className="group/title">
          <h3 className="text-foreground group-hover/title:text-primary line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-medium transition-colors sm:min-h-[2.75rem] sm:text-[0.9375rem]">
            {name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-primary text-lg font-bold tabular-nums tracking-tight sm:text-xl">
            {formatPrice(priceCents)}
          </span>
          {hasDiscount ? (
            <>
              <span className="text-muted-foreground text-sm line-through tabular-nums">
                {formatPrice(compareAtPriceCents)}
              </span>
              <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase">
                Promo
              </span>
            </>
          ) : null}
        </div>

        {sizes.length > 0 ? (
          <div className="space-y-1">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase sm:text-xs">
              Tailles
            </p>
            <SizeAgeBadgeList items={sizes} variant="size" max={4} />
          </div>
        ) : ageLabel ? (
          <SizeAgeBadgeList items={[ageLabel]} variant="age" max={1} />
        ) : null}

        <ButtonLink
          href={href}
          variant="secondary"
          size="sm"
          className="mt-auto min-h-11 w-full rounded-xl border-tilouki-sage/20 bg-tilouki-sage-light/50 text-tilouki-sage-dark hover:bg-tilouki-sage-light"
        >
          Voir le produit
          <ArrowRight className="size-3.5" />
        </ButtonLink>
      </div>
    </article>
  );
}
