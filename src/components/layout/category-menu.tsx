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
        "border-border/60 border-b bg-card/90",
        className,
      )}
      aria-label="Catégories"
    >
      <div className="container-tilouki flex flex-col justify-center py-2 md:h-[var(--category-nav-height)] md:py-0">
        <ul className="flex flex-wrap items-center gap-1.5 md:flex-nowrap md:overflow-x-auto md:py-1.5 md:scrollbar-hide">
          <li className="shrink-0">
            <Link
              href="/catalogue"
              className={cn(
                "inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
                pathname === "/catalogue"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              Tout voir
            </Link>
          </li>
          {categories.map((category) => {
            const href = `/categorie/${category.slug}`;
            const isActive = pathname === href;
            return (
              <li key={category.slug} className="shrink-0">
                <Link
                  href={href}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary ring-primary/20 ring-1"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {category.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
