"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { CategoryNavDropdown } from "@/components/layout/category-nav-dropdown";
import { useShop } from "@/components/providers/shop-provider";
import { NAV_HREF } from "@/lib/navigation/nav-config";
import { cn } from "@/lib/utils";

interface CategoryMenuProps {
  className?: string;
}

function isNavItemActive(
  pathname: string,
  href: string,
  searchParams: URLSearchParams,
): boolean {
  if (href.startsWith("/#")) {
    return pathname === "/";
  }

  if (href === NAV_HREF.petitsPrix) {
    return pathname === "/catalogue" && searchParams.get("promo") === "petit-prix";
  }

  if (href.startsWith("/categorie/")) {
    return pathname === href.split("?")[0];
  }

  if (href.startsWith("/catalogue")) {
    return pathname === "/catalogue" && !searchParams.get("promo");
  }

  return pathname === href;
}

function isUniverseActive(pathname: string, slug: string): boolean {
  return (
    pathname === `/categorie/${slug}` || pathname.startsWith(`/categorie/${slug}/`)
  );
}

export function CategoryMenu({ className }: CategoryMenuProps) {
  const { navigation } = useShop();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav
      className={cn(
        "border-border/40 bg-tilouki-cloud/50 hidden border-b md:block",
        className,
      )}
      aria-label="Navigation boutique"
    >
      <div className="container-tilouki flex h-[var(--category-nav-height)] items-center">
        <ul className="scrollbar-hide flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto py-1">
          {navigation.topItems.map((item) => {
            if (item.kind === "universe") {
              return (
                <li key={item.id} className="shrink-0">
                  <CategoryNavDropdown
                    item={item}
                    isActive={isUniverseActive(pathname, item.slug)}
                  />
                </li>
              );
            }

            const isActive = isNavItemActive(pathname, item.href, searchParams);

            return (
              <li key={item.id} className="shrink-0">
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center rounded-[var(--radius-button)] px-3 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-tilouki-jade-soft text-tilouki-teal-dark"
                      : "text-foreground hover:bg-tilouki-jade-soft/50 hover:text-tilouki-teal-dark",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
