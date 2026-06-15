import type { BlogArticle } from "@/content/blog/articles";
import { BlogArticleNewsletter } from "@/components/blog/blog-article-newsletter";
import { BlogArticleProducts } from "@/components/blog/blog-article-products";
import { BlogArticleShopCta } from "@/components/blog/blog-article-shop-cta";
import { BlogCatalogueNotify } from "@/components/blog/blog-catalogue-notify";
import { BlogRelatedArticles } from "@/components/blog/blog-related-articles";
import { getBlogCategoryCatalogMeta } from "@/lib/blog/category-catalog";
import { pickRelatedBlogArticles } from "@/lib/blog/related-articles";
import { getBlogRelatedProducts } from "@/lib/blog/shop-bridge";
import { hasActiveCatalogueProducts } from "@/lib/supabase/queries/products";

interface BlogArticleContinuityProps {
  article: BlogArticle;
}

export async function BlogArticleContinuity({ article }: BlogArticleContinuityProps) {
  const catalogueHasProducts = await hasActiveCatalogueProducts();
  const relatedArticles = pickRelatedBlogArticles(article);
  const catalogMeta = getBlogCategoryCatalogMeta(article.category);

  const productsResult = catalogueHasProducts
    ? await getBlogRelatedProducts(article.category)
    : null;

  return (
    <div className="space-y-10 border-t border-tilouki-jade/20 pt-10">
      <BlogRelatedArticles articles={relatedArticles} />
      <BlogArticleShopCta category={article.category} catalogueHasProducts={catalogueHasProducts} />
      {catalogueHasProducts && productsResult && productsResult.products.length > 0 ? (
        <BlogArticleProducts
          title={catalogMeta.productSectionTitle}
          description={catalogMeta.productSectionDescription}
          products={productsResult.products}
          categoryHref={productsResult.categoryHref}
        />
      ) : !catalogueHasProducts ? (
        <BlogCatalogueNotify />
      ) : null}
      <BlogArticleNewsletter articleSlug={article.slug} />
    </div>
  );
}
