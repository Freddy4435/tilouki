import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@/types/catalog";

interface CartRecommendationsProps {
  products: ProductListItem[];
  title?: string;
}

export function CartRecommendations({
  products,
  title = "Vous pourriez aimer",
}: CartRecommendationsProps) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
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
          />
        ))}
      </div>
    </section>
  );
}
