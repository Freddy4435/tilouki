import { FavoriteProductCard } from "@/components/favorites/favorite-product-card";
import type { ProductListItem } from "@/types/catalog";

interface FavoritesProductListProps {
  products: ProductListItem[];
}

export function FavoritesProductList({ products }: FavoritesProductListProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {products.map((product) => (
        <li key={product.id}>
          <FavoriteProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
