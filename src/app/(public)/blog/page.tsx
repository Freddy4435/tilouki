import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogArticleCard } from "@/components/blog/blog-article-card";
import { BlogCategoryFilters } from "@/components/blog/blog-category-filters";
import { BlogHero } from "@/components/blog/blog-hero";
import {
  type BlogCategory,
  getBlogArticlesByCategory,
  getPublishedBlogArticles,
} from "@/content/blog/articles";
import { getBlogCategoryLabel } from "@/lib/blog/categories";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

const BLOG_INDEX_DESCRIPTION =
  "Le Carnet Tilouki : conseils pratiques sur les tailles, matières, entretien et quotidien des vêtements enfants — sans promesses excessives.";

export async function generateMetadata({
  searchParams,
}: BlogIndexPageProps): Promise<Metadata> {
  const { category: rawCategory } = await searchParams;
  const category = isBlogCategory(rawCategory) ? rawCategory : undefined;

  return buildPageMetadata({
    title: category
      ? `Le Carnet Tilouki — ${getBlogCategoryLabel(category)}`
      : "Le Carnet Tilouki — Blog vêtements enfants",
    description: BLOG_INDEX_DESCRIPTION,
    path: category ? `/blog?category=${category}` : "/blog",
    noIndex: Boolean(category),
  });
}

function isBlogCategory(value: string | undefined): value is BlogCategory {
  return (
    value === "tailles" ||
    value === "matieres" ||
    value === "bebe" ||
    value === "quotidien" ||
    value === "entretien" ||
    value === "budget"
  );
}

interface BlogIndexPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const { category: rawCategory } = await searchParams;
  const category = isBlogCategory(rawCategory) ? rawCategory : undefined;

  const articles = category
    ? getBlogArticlesByCategory(category)
    : getPublishedBlogArticles();

  return (
    <>
      <BlogHero />

      <div className="container-tilouki section-tilouki">
        <Suspense fallback={<div className="h-9" aria-hidden />}>
          <BlogCategoryFilters />
        </Suspense>

        {category ? (
          <p className="text-muted-foreground mt-6 text-center text-sm">
            {articles.length} article{articles.length > 1 ? "s" : ""} —{" "}
            {getBlogCategoryLabel(category)}
          </p>
        ) : null}

        {articles.length === 0 ? (
          <p className="text-muted-foreground mt-12 text-center text-sm">
            Aucun article dans cette catégorie pour le moment.
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.slug}>
                <BlogArticleCard article={article} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
