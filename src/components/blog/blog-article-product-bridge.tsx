import type { BlogCategory } from "@/content/blog/articles";
import { BlogArticleProducts } from "@/components/blog/blog-article-products";
import { BlogCatalogueNotify } from "@/components/blog/blog-catalogue-notify";
import { getBlogCategoryCatalogMeta } from "@/lib/blog/category-catalog";
import { getBlogRelatedProducts } from "@/lib/blog/shop-bridge";
import { hasActiveCatalogueProducts } from "@/lib/supabase/queries/products";

interface BlogArticleProductBridgeProps {
  category: BlogCategory;
}

/** Sélection catalogue affichée en milieu d'article — avant la fin du guide. */
export async function BlogArticleProductBridge({
  category,
}: BlogArticleProductBridgeProps) {
  const catalogueHasProducts = await hasActiveCatalogueProducts();
  const catalogMeta = getBlogCategoryCatalogMeta(category);

  if (!catalogueHasProducts) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed p-4">
        <BlogCatalogueNotify />
      </div>
    );
  }

  const productsResult = await getBlogRelatedProducts(category);
  if (productsResult.products.length === 0) return null;

  return (
    <BlogArticleProducts
      title={catalogMeta.productSectionTitle}
      description={catalogMeta.productSectionDescription}
      products={productsResult.products}
      categoryHref={productsResult.categoryHref}
    />
  );
}
