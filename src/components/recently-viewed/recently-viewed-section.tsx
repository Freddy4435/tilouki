"use client";

import { useMemo } from "react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { useProductsBySlugs } from "@/hooks/use-products-by-slugs";
import { orderProductsByRecentlyViewedSlugs } from "@/lib/recently-viewed/display";
import { entriesToSlugKey } from "@/lib/recently-viewed/slugs";
import { useRecentlyViewedStore } from "@/lib/recently-viewed/store";
import { cn } from "@/lib/utils";

function slugKeyToList(key: string): string[] {
  return key ? key.split("\0") : [];
}

interface RecentlyViewedSectionProps {
  title?: string;
  description?: string;
  excludeSlugs?: string[];
  className?: string;
  minProducts?: number;
  layout?: "grid" | "scroll-mobile";
}

export function RecentlyViewedSection({
  title = "Vu récemment",
  description = "Retrouvez les articles que vous avez consultés sur cet appareil.",
  excludeSlugs = [],
  className,
  minProducts = 1,
  layout = "scroll-mobile",
}: RecentlyViewedSectionProps) {
  const recentSlugKey = useRecentlyViewedStore((state) =>
    entriesToSlugKey(state.entries),
  );
  const allSlugs = useMemo(() => slugKeyToList(recentSlugKey), [recentSlugKey]);

  const slugs = useMemo(() => {
    if (excludeSlugs.length === 0) return allSlugs;
    const excluded = new Set(excludeSlugs);
    return allSlugs.filter((slug) => !excluded.has(slug));
  }, [allSlugs, excludeSlugs]);

  const { products, isLoading } = useProductsBySlugs(slugs);

  const orderedProducts = useMemo(
    () => (products ? orderProductsByRecentlyViewedSlugs(products, slugs) : []),
    [products, slugs],
  );

  const shouldShow =
    slugs.length > 0 && (isLoading || orderedProducts.length >= minProducts);

  if (!shouldShow) return null;
  if (!isLoading && orderedProducts.length < minProducts) return null;

  return (
    <section
      className={cn("tilouki-motion-fade-up space-y-4", className)}
      aria-labelledby="recently-viewed-heading"
    >
      <div className="space-y-1">
        <h2 id="recently-viewed-heading" className="text-lg font-semibold">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={Math.min(slugs.length, 4)} />
      ) : (
        <CatalogueProductList products={orderedProducts} layout={layout} />
      )}
    </section>
  );
}
