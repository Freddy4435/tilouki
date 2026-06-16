import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

interface CataloguePaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  basePath?: string;
  className?: string;
}

function buildPageHref(
  page: number,
  searchParams: Record<string, string | undefined>,
  basePath: string,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page" && key !== "categorie") params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CataloguePagination({
  page,
  totalPages,
  searchParams,
  basePath = "/catalogue",
  className,
}: CataloguePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav
      className={cn("mt-10 flex items-center justify-center gap-2", className)}
      aria-label="Pagination"
    >
      {page <= 1 ? (
        <span
          className="border-input bg-background inline-flex h-8 items-center rounded-md border px-3 text-sm opacity-50"
          aria-disabled="true"
        >
          Précédent
        </span>
      ) : (
        <ButtonLink
          href={buildPageHref(page - 1, searchParams, basePath)}
          variant="outline"
          size="sm"
        >
          Précédent
        </ButtonLink>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, index) => {
          const prev = pages[index - 1];
          const showEllipsis = prev != null && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis ? (
                <span className="text-muted-foreground px-1">…</span>
              ) : null}
              <Link
                href={buildPageHref(p, searchParams, basePath)}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground",
                )}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Link>
            </span>
          );
        })}
      </div>

      {page >= totalPages ? (
        <span
          className="border-input bg-background inline-flex h-8 items-center rounded-md border px-3 text-sm opacity-50"
          aria-disabled="true"
        >
          Suivant
        </span>
      ) : (
        <ButtonLink
          href={buildPageHref(page + 1, searchParams, basePath)}
          variant="outline"
          size="sm"
        >
          Suivant
        </ButtonLink>
      )}
    </nav>
  );
}
