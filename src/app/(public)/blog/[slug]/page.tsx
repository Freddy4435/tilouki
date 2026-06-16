import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { BlogArticleBody } from "@/components/blog/blog-article-body";
import { BlogArticleContinuity } from "@/components/blog/blog-article-continuity";
import { BlogArticleToc } from "@/components/blog/blog-article-toc";
import { BlogKeyTakeaways } from "@/components/blog/blog-key-takeaways";
import { EditorialImage } from "@/components/media/editorial-image";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Badge } from "@/components/ui/badge";
import {
  getAllBlogSlugs,
  getBlogArticleBySlug,
} from "@/content/blog/articles";
import { getBlogCategoryLabel } from "@/lib/blog/categories";
import { resolveBlogHeroImage } from "@/lib/media/editorial-images";
import { buildBreadcrumbJsonLd, buildArticleJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article || article.published === false) {
    return { title: "Article introuvable", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/blog/${article.slug}`,
    ogType: "article",
    articlePublishedTime: article.publishedAt,
  });
}

function formatPublishedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article || article.published === false) {
    notFound();
  }

  const heroImage = resolveBlogHeroImage(article.heroImageId);
  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Le Carnet", path: "/blog" },
    { name: article.title, path: `/blog/${article.slug}` },
  ];

  return (
    <article className="pb-16">
      <JsonLdScript
        data={[
          buildArticleJsonLd({
            title: article.title,
            description: article.metaDescription,
            slug: article.slug,
            publishedAt: article.publishedAt,
            categoryLabel: getBlogCategoryLabel(article.category),
            imageUrl: absoluteUrl(heroImage.src),
          }),
          buildBreadcrumbJsonLd(breadcrumbs),
        ]}
      />

      <div className="maison-surface maison-surface-plum border-b border-tilouki-plum/12">
        <div className="container-tilouki section-tilouki max-w-3xl">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-tilouki-plum mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Le Carnet Tilouki
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-tilouki-plum-soft text-tilouki-plum">
              {getBlogCategoryLabel(article.category)}
            </Badge>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Clock className="size-3.5" aria-hidden />
              {article.readingTime}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatPublishedDate(article.publishedAt)}
            </span>
          </div>

          <h1 className="font-heading text-section-title-plum mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
            {article.excerpt}
          </p>
        </div>
      </div>

      <EditorialImage
        imageId={heroImage.id}
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        sizes="(max-width: 1280px) 100vw, 1024px"
        className="mx-auto aspect-[21/9] max-w-5xl"
      />

      <div className="container-tilouki section-tilouki">
        <div className="mx-auto grid max-w-3xl gap-10 lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
          <div className="min-w-0 space-y-10">
            <BlogArticleToc content={article.content} className="lg:hidden" />
            <BlogArticleBody content={article.content} />
            <BlogKeyTakeaways items={article.keyTakeaways} />
            <BlogArticleContinuity article={article} />
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-28">
            <BlogArticleToc content={article.content} />
          </aside>
        </div>
      </div>
    </article>
  );
}
