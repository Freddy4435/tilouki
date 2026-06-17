import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ProductCardPrice } from "@/components/product/product-card-price";
import { ProductStockAlertForm } from "@/components/product/product-stock-alert-form";
import { listOutOfStockQuickAddOptions } from "@/lib/catalog/stock-alert-variants";
import { resolveFavoriteVariantAvailability } from "@/lib/favorites/variants";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import type { ProductListItem } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface FavoriteProductCardProps {
  product: ProductListItem;
}

export function FavoriteProductCard({ product }: FavoriteProductCardProps) {
  const href = `/produit/${product.slug}`;
  const { available, outOfStock } = resolveFavoriteVariantAvailability(product);
  const inStock = (product.totalStock ?? 0) > 0;

  return (
    <article className="bg-card flex gap-3 rounded-[var(--radius-card)] border p-3 shadow-[var(--shadow-soft)] sm:gap-4 sm:p-4">
      <Link
        href={href}
        className="bg-tilouki-cloud relative size-[5.5rem] shrink-0 overflow-hidden rounded-[var(--radius-button)] sm:size-28"
      >
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.primaryImageAlt ?? product.name}
            fill
            sizes={IMAGE_SIZES.productThumbRow}
            className="object-cover"
          />
        ) : (
          <span className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Photo
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.categoryName ? (
              <p className="text-retail-label text-tilouki-ink-muted truncate">
                {product.categoryName}
              </p>
            ) : null}
            <Link href={href} className="hover:text-primary block font-semibold leading-snug">
              <h2 className="line-clamp-2 text-sm sm:text-base">{product.name}</h2>
            </Link>
          </div>
          <FavoriteButton slug={product.slug} className="!static" />
        </div>

        <ProductCardPrice
          priceCents={product.minPriceCents}
          compareAtPriceCents={product.compareAtPriceCents}
          className="[&_span:first-child]:text-lg"
        />

        <FavoriteSizeAvailability
          available={available}
          outOfStock={outOfStock}
          fullyOut={!inStock}
        />

        {outOfStock.length > 0 ? (
          <ProductStockAlertForm
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            outOfStockVariants={listOutOfStockQuickAddOptions(
              (product.quickAddVariants ?? []).filter(
                (variant) => variant.stockQuantity <= 0,
              ),
            )}
            compact
            className="mt-1"
          />
        ) : null}

        <Link
          href={href}
          className={cn(
            "border-border/80 text-foreground hover:border-primary/50 hover:bg-primary/5 mt-auto inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border bg-card text-sm font-semibold transition-colors",
            !inStock && "text-muted-foreground",
          )}
        >
          {inStock ? "Voir les tailles" : "Voir la fiche"}
          <ArrowRight className="size-3.5 opacity-80" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function FavoriteSizeAvailability({
  available,
  outOfStock,
  fullyOut,
}: {
  available: string[];
  outOfStock: string[];
  fullyOut: boolean;
}) {
  if (fullyOut && outOfStock.length === 0 && available.length === 0) {
    return (
      <p className="text-destructive text-xs font-semibold">Rupture sur toutes les tailles</p>
    );
  }

  if (available.length === 0 && outOfStock.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {available.length > 0 ? (
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            En stock
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {available.map((size) => (
              <li key={`in-${size}`}>
                <span className="bg-tilouki-pistache-soft/70 text-tilouki-navy inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
                  {size}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {outOfStock.length > 0 ? (
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            Rupture
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {outOfStock.map((size) => (
              <li key={`out-${size}`}>
                <span className="bg-muted/60 text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-medium line-through decoration-[var(--tilouki-border-subtle)]">
                  {size}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
