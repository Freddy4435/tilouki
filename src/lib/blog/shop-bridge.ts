import type { BlogCategory } from "@/content/blog/articles";
import { getBlogCategoryCatalogMeta } from "@/lib/blog/category-catalog";
import { getActiveProducts } from "@/lib/supabase/queries/products";
import type { ProductListItem } from "@/types/catalog";

export interface BlogRelatedProductsResult {
  products: ProductListItem[];
  categorySlug: string | null;
  categoryHref: string | null;
}

/** Nombre de paragraphes lus avant le bloc produits sur une page guide. */
export const BLOG_EARLY_PRODUCTS_AFTER_PARAGRAPHS = 2;

export async function getBlogRelatedProducts(
  category: BlogCategory,
  limit = 4,
): Promise<BlogRelatedProductsResult> {
  const meta = getBlogCategoryCatalogMeta(category);

  for (const categorySlug of meta.categorySlugs) {
    const products = await getActiveProducts({ categorySlug, limit });
    if (products.length > 0) {
      return {
        products,
        categorySlug,
        categoryHref: `/categorie/${categorySlug}`,
      };
    }
  }

  const fallback = await getActiveProducts({ limit });
  return {
    products: fallback.slice(0, limit),
    categorySlug: fallback[0]?.categorySlug ?? null,
    categoryHref: fallback[0]?.categorySlug
      ? `/categorie/${fallback[0].categorySlug}`
      : "/catalogue",
  };
}
