import Link from "next/link";
import { Clock } from "lucide-react";

import { EditorialImage } from "@/components/media/editorial-image";
import type { BlogArticle } from "@/content/blog/articles";
import { Badge } from "@/components/ui/badge";
import { getBlogCategoryLabel } from "@/lib/blog/categories";
import { resolveBlogHeroImage } from "@/lib/media/editorial-images";

function formatPublishedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function BlogArticleCard({ article }: { article: BlogArticle }) {
  const heroImage = resolveBlogHeroImage(article.heroImageId);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-tilouki-plum/15 bg-card shadow-[var(--shadow-soft)] transition-shadow hover:border-tilouki-plum/25 hover:shadow-[var(--shadow-card)]">
      <EditorialImage
        imageId={heroImage.id}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="aspect-[16/10]"
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-tilouki-plum-soft text-tilouki-plum">
            {getBlogCategoryLabel(article.category)}
          </Badge>
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Clock className="size-3.5" aria-hidden />
            {article.readingTime}
          </span>
        </div>

        <h2 className="font-heading text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={`/blog/${article.slug}`}
            className="text-foreground group-hover:text-tilouki-plum transition-colors"
          >
            {article.title}
          </Link>
        </h2>

        <p className="text-muted-foreground line-clamp-3 flex-1 text-sm leading-relaxed">
          {article.excerpt}
        </p>

        <p className="text-muted-foreground text-xs">
          {formatPublishedDate(article.publishedAt)}
        </p>
      </div>
    </article>
  );
}
