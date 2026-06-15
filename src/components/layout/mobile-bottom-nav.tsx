"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag } from "lucide-react";

import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Accueil", icon: Home, match: (path: string) => path === "/" },
  {
    href: "/catalogue",
    label: "Boutique",
    icon: LayoutGrid,
    match: (path: string) =>
      path.startsWith("/catalogue") ||
      path.startsWith("/categorie") ||
      path.startsWith("/produit"),
  },
  {
    href: "/panier",
    label: "Panier",
    icon: ShoppingBag,
    match: (path: string) => path.startsWith("/panier") || path.startsWith("/commande"),
  },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());

  if (pathname.startsWith("/commande")) return null;

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="border-border/80 bg-card/95 fixed inset-x-0 bottom-[var(--cookie-banner-height,0px)] z-50 border-t shadow-[0_-2px_16px_oklch(0.28_0.02_50_/_0.06)] backdrop-blur-md md:hidden"
      style={{ height: "var(--mobile-bottom-nav-height)" }}
    >
      <ul className="grid h-full grid-cols-3">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          const isCart = href === "/panier";
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span>{label}</span>
                {isCart && itemCount > 0 ? (
                  <span className="bg-primary text-primary-foreground absolute top-1.5 right-[calc(50%-1.25rem)] flex size-4 items-center justify-center rounded-full text-[9px] font-bold tabular-nums">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
