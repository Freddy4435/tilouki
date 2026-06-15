import { splitBlogParagraphs } from "@/lib/blog/content";
import { cn } from "@/lib/utils";

interface BlogArticleBodyProps {
  content: string;
  className?: string;
}

/** Corps d'article en paragraphes texte — pas de HTML brut injecté. */
export function BlogArticleBody({ content, className }: BlogArticleBodyProps) {
  const paragraphs = splitBlogParagraphs(content);

  return (
    <div className={cn("space-y-4 text-sm leading-relaxed sm:text-base", className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={`section-${index}`} id={`section-${index}`} className="text-foreground/90">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
