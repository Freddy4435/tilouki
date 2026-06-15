import type { BlogArticle } from "@/content/blog/articles";
import { BlogArticleCard } from "@/components/blog/blog-article-card";

interface BlogRelatedArticlesProps {
  articles: BlogArticle[];
}

export function BlogRelatedArticles({ articles }: BlogRelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="blog-related-articles-title" className="space-y-4">
      <div className="space-y-1">
        <h2 id="blog-related-articles-title" className="font-heading text-lg font-semibold">
          Poursuivre la lecture
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Deux articles du Carnet pour aller plus loin, dans la même veine.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <li key={article.slug}>
            <BlogArticleCard article={article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
