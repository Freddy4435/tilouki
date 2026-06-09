"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useShop } from "@/components/providers/shop-provider";
import { cn } from "@/lib/utils";

interface CategoryMenuProps {
  className?: string;
}

export function CategoryMenu({ className }: CategoryMenuProps) {
  const { categories } = useShop();
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "bg-tilouki-white/90 border-border/60 border-b",
        className,
      )}
      style={{ height: "var(--category-nav-height)" }}
      aria-label="Catégories"
    >
      <div className="container-tilouki flex h-full items-center">
        <ul className="scrollbar-hide flex h-full items-center gap-1 overflow-x-auto py-1.5">
          <li className="shrink-0">
            <Link
              href="/catalogue"
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
                pathname === "/catalogue"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              Tout voir
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug} className="shrink-0">
              <Link
                href={`/categorie/${category.slug}`}
                className={cn(
                  "inline-flex h-8 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                  "text-foreground hover:bg-muted",
                )}
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
