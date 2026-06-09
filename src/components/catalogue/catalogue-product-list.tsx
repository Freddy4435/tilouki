import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductListItem } from "@/types/catalog";

interface CatalogueProductListProps {
  products: ProductListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CatalogueProductList({
  products,
  emptyTitle,
  emptyDescription,
}: CatalogueProductListProps) {
  if (products.length === 0) {
    return (
      <ProductGrid emptyTitle={emptyTitle} emptyDescription={emptyDescription} />
    );
  }

  return (
    <ProductGrid>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          slug={product.slug}
          name={product.name}
          priceCents={product.minPriceCents}
          compareAtPriceCents={product.compareAtPriceCents}
          imageUrl={product.primaryImageUrl}
          imageAlt={product.primaryImageAlt ?? product.name}
          sizes={product.sizes}
          ageLabel={product.ageLabels[0]}
          badges={product.badges}
          priority={index < 4}
        />
      ))}
    </ProductGrid>
  );
}
