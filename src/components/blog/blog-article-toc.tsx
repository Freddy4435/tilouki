import Link from "next/link";

import { buildArticleToc } from "@/lib/blog/content";
import { cn } from "@/lib/utils";

interface BlogArticleTocProps {
  content: string;
  className?: string;
}

export function BlogArticleToc({ content, className }: BlogArticleTocProps) {
  const items = buildArticleToc(content);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Sommaire de l'article"
      className={cn(
        "bg-tilouki-jade-soft/40 border-tilouki-jade/25 rounded-2xl border p-5",
        className,
      )}
    >
      <p className="text-tilouki-teal-dark mb-3 text-sm font-semibold">Sommaire</p>
      <ol className="space-y-2 text-sm">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              className="text-muted-foreground hover:text-tilouki-teal-dark leading-relaxed transition-colors"
            >
              <span className="text-tilouki-teal-dark mr-2 font-medium tabular-nums">
                {index + 1}.
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
