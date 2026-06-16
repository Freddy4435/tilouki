import type { BlogArticle } from "@/content/blog/articles";
import { BlogArticleNewsletter } from "@/components/blog/blog-article-newsletter";
import { BlogArticleShopCta } from "@/components/blog/blog-article-shop-cta";
import { BlogRelatedArticles } from "@/components/blog/blog-related-articles";
import { pickRelatedBlogArticles } from "@/lib/blog/related-articles";
import { hasActiveCatalogueProducts } from "@/lib/supabase/queries/products";

interface BlogArticleContinuityProps {
  article: BlogArticle;
}

export async function BlogArticleContinuity({ article }: BlogArticleContinuityProps) {
  const catalogueHasProducts = await hasActiveCatalogueProducts();
  const relatedArticles = pickRelatedBlogArticles(article);

  return (
    <div className="border-tilouki-jade/20 space-y-10 border-t pt-10">
      <BlogArticleShopCta
        category={article.category}
        catalogueHasProducts={catalogueHasProducts}
      />
      <BlogRelatedArticles articles={relatedArticles} />
      <BlogArticleNewsletter articleSlug={article.slug} />
    </div>
  );
}
