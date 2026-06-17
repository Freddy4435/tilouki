import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { buildCategoryHref } from "@/lib/navigation/catalog-href";
import type { ProductListItem } from "@/types/catalog";

interface ProductOutfitSuggestionsProps {
  products: ProductListItem[];
  categorySlug?: string | null;
  categoryName?: string | null;
}

export function ProductOutfitSuggestions({
  products,
  categorySlug,
  categoryName,
}: ProductOutfitSuggestionsProps) {
  if (products.length < 2) return null;

  const title = categoryName ? `Va avec — ${categoryName.toLowerCase()}` : "Va avec";
  const rayonHref = categorySlug ? buildCategoryHref(categorySlug) : "/catalogue";

  return (
    <section aria-labelledby="outfit-suggestions-heading">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <h2 id="outfit-suggestions-heading" className="text-section-title text-lg">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Compléter la tenue avec 2 à 4 pièces assorties en stock.
          </p>
        </header>
        {categorySlug ? (
          <a
            href={rayonHref}
            className="text-tilouki-pistache text-sm font-semibold hover:underline"
          >
            Tout le rayon
          </a>
        ) : null}
      </div>
      <CatalogueProductList
        products={products.slice(0, 4)}
        layout="scroll-mobile"
        priorityLimit={0}
      />
    </section>
  );
}
