"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { BlogCategory } from "@/content/blog/articles";
import { BLOG_CATEGORIES, getBlogCategoryLabel } from "@/lib/blog/categories";
import { cn } from "@/lib/utils";

export function BlogCategoryFilters() {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") as BlogCategory | null;

  return (
    <nav
      aria-label="Filtrer par thème"
      className="scrollbar-hide flex flex-wrap items-center justify-center gap-2"
    >
      <FilterChip href="/blog" active={!active}>
        Tous
      </FilterChip>
      {BLOG_CATEGORIES.map((category) => (
        <FilterChip
          key={category}
          href={`/blog?category=${category}`}
          active={active === category}
        >
          {getBlogCategoryLabel(category)}
        </FilterChip>
      ))}
    </nav>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
        active
          ? "border-tilouki-teal-dark bg-tilouki-teal-dark text-white"
          : "border-tilouki-jade/40 bg-background text-foreground hover:bg-tilouki-jade-soft/60",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
