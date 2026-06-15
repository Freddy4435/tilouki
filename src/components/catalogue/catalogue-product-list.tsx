import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { isProductNew } from "@/lib/catalog/product-new";
import type { ProductBadgeType } from "@/components/product/product-badges";
import type { ProductListItem } from "@/types/catalog";

interface CatalogueProductListProps {
  products: ProductListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href: string };
  layout?: "grid" | "scroll-mobile";
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
  priorityLimit,
  className,
}: CatalogueProductListProps) {
  const resolvedPriorityLimit = priorityLimit ?? (layout === "scroll-mobile" ? 2 : 4);
  if (products.length === 0) {
    return (
      <ProductGrid
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={emptyAction}
        className={className}
      />
    );
  }

  return (
    <ProductGrid layout={layout} className={className}>
      {products.map((product, index) => (
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
          variant={layout === "scroll-mobile" ? "compact" : "default"}
        />
      ))}
    </ProductGrid>
  );
}
