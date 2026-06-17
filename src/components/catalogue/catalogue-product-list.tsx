import { ProductCard } from "@/components/product/product-card";
import { ProductCardRail } from "@/components/product/product-card-rail";
import { ProductGrid } from "@/components/product/product-grid";
import { isProductNew } from "@/lib/catalog/product-new";
import { applyStorefrontListItemGuards } from "@/lib/catalog/product-card-data";
import { isProductStorefrontListed } from "@/lib/catalog/product-sellability";
import type { ProductBadgeType } from "@/components/product/product-badges";
import type { ProductListItem } from "@/types/catalog";

interface CatalogueProductListProps {
  products: ProductListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href: string };
  layout?: "grid" | "scroll-mobile";
  density?: "default" | "catalog";
  /** Nombre de cartes avec `priority` (LCP) — défaut 2 en carrousel, 4 en grille. */
  priorityLimit?: number;
  className?: string;
}

function mergeBadges(product: ProductListItem): ProductBadgeType[] {
  const badges: ProductBadgeType[] = [];
  if (isProductNew(product.createdAt)) badges.push("new");
  if (product.totalStock === 1) badges.push("last-piece");
  for (const badge of product.badges) {
    if (!badges.includes(badge)) badges.push(badge);
  }
  return badges.slice(0, 3);
}

export function CatalogueProductList({
  products,
  emptyTitle,
  emptyDescription,
  emptyAction,
  layout = "grid",
  density = "catalog",
  priorityLimit,
  className,
}: CatalogueProductListProps) {
  const resolvedPriorityLimit = priorityLimit ?? (layout === "scroll-mobile" ? 2 : 4);
  const cardVariant =
    layout === "scroll-mobile"
      ? "premium-rail"
      : density === "catalog"
        ? "compact"
        : "default";
  const listedProducts = products
    .map(applyStorefrontListItemGuards)
    .filter(isProductStorefrontListed);

  if (listedProducts.length === 0) {
    return (
      <ProductGrid
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={emptyAction}
        density={density}
        className={className}
      />
    );
  }

  return (
    <ProductGrid layout={layout} density={density} className={className}>
      {listedProducts.map((product, index) =>
        layout === "scroll-mobile" ? (
          <ProductCardRail
            key={product.id}
            slug={product.slug}
            name={product.name}
            priceCents={product.minPriceCents}
            compareAtPriceCents={product.compareAtPriceCents}
            imageUrl={product.primaryImageUrl}
            imageAlt={product.primaryImageAlt ?? product.name}
            categoryName={product.categoryName}
            sizes={product.sizes}
            ageLabel={product.ageLabels[0]}
            badges={mergeBadges(product)}
            totalStock={product.totalStock}
            priority={index < resolvedPriorityLimit}
          />
        ) : (
          <ProductCard
            key={product.id}
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceCents={product.minPriceCents}
            compareAtPriceCents={product.compareAtPriceCents}
            imageUrl={product.primaryImageUrl}
            imageAlt={product.primaryImageAlt ?? product.name}
            secondaryImageUrl={product.secondaryImageUrl}
            secondaryImageAlt={product.secondaryImageAlt}
            colorOptions={product.colorOptions}
            quickAddVariants={product.quickAddVariants}
            categoryName={product.categoryName}
            material={product.material}
            sizes={product.sizes}
            ageLabel={product.ageLabels[0]}
            badges={mergeBadges(product)}
            totalStock={product.totalStock}
            ratingAverage={product.ratingAverage}
            ratingCount={product.ratingCount}
            priority={index < resolvedPriorityLimit}
            variant={cardVariant}
          />
        ),
      )}
    </ProductGrid>
  );
}
