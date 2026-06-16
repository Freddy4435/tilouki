import { splitBlogParagraphs } from "@/lib/blog/content";
import { BLOG_EARLY_PRODUCTS_AFTER_PARAGRAPHS } from "@/lib/blog/shop-bridge";
import { cn } from "@/lib/utils";

interface BlogArticleBodyProps {
  content: string;
  className?: string;
  /** Index du premier paragraphe affiché (pour découpe autour du bloc produits). */
  startIndex?: number;
  /** Nombre max de paragraphes (défaut : jusqu'à la fin). */
  limit?: number;
}

/** Corps d'article en paragraphes texte — pas de HTML brut injecté. */
export function BlogArticleBody({
  content,
  className,
  startIndex = 0,
  limit,
}: BlogArticleBodyProps) {
  const allParagraphs = splitBlogParagraphs(content);
  const paragraphs = allParagraphs.slice(
    startIndex,
    limit === undefined ? undefined : startIndex + limit,
  );

  return (
    <div className={cn("space-y-4 text-sm leading-relaxed sm:text-base", className)}>
      {paragraphs.map((paragraph, index) => {
        const sectionIndex = startIndex + index;
        return (
          <p
            key={`section-${sectionIndex}`}
            id={`section-${sectionIndex}`}
            className="text-foreground/90"
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

/** Point d'insertion du bloc produits (après N paragraphes, sans dépasser la moitié). */
export function getBlogProductInsertIndex(content: string): number {
  const total = splitBlogParagraphs(content).length;
  if (total <= 3) return 1;
  return Math.min(BLOG_EARLY_PRODUCTS_AFTER_PARAGRAPHS, Math.floor(total / 2));
}
