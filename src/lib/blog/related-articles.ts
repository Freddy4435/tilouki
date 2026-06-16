import type { BlogArticle } from "@/content/blog/articles";
import { getPublishedBlogArticles } from "@/content/blog/articles";

export function pickRelatedBlogArticles(
  article: BlogArticle,
  limit = 2,
): BlogArticle[] {
  const published = getPublishedBlogArticles().filter(
    (item) => item.slug !== article.slug,
  );

  const sameCategory = published.filter((item) => item.category === article.category);
  const others = published.filter((item) => item.category !== article.category);

  const picked: BlogArticle[] = [];
  for (const candidate of [...sameCategory, ...others]) {
    if (picked.length >= limit) break;
    if (!picked.some((item) => item.slug === candidate.slug)) {
      picked.push(candidate);
    }
  }

  return picked;
}
