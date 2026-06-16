import { CatalogueFiltersMobile } from "@/components/catalogue/catalogue-filters-mobile";
import type { CatalogueFacets, Category } from "@/types/catalog";

interface CatalogueMobileFilterBarProps {
  categories: Category[];
  facets: CatalogueFacets;
  total: number;
  lockedCategorySlug?: string;
  basePath?: string;
}

/** Barre filtres mobile collée avant la grille produits. */
export function CatalogueMobileFilterBar({
  categories,
  facets,
  total,
  lockedCategorySlug,
  basePath,
}: CatalogueMobileFilterBarProps) {
  return (
    <div className="bg-background/95 border-tilouki-jade/15 sticky top-[var(--header-height)] z-20 mb-3 min-w-0 border-b py-2.5 backdrop-blur-sm lg:hidden">
      <CatalogueFiltersMobile
        categories={categories}
        facets={facets}
        total={total}
        lockedCategorySlug={lockedCategorySlug}
        basePath={basePath}
      />
    </div>
  );
}
