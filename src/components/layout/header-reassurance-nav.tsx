"use client";

import Link from "next/link";

import { useShop } from "@/components/providers/shop-provider";
import { NAV_HREF, NAV_REASSURANCE_DESKTOP } from "@/lib/navigation/nav-config";
import { cn } from "@/lib/utils";

export function HeaderReassuranceNav({ className }: { className?: string }) {
  const { contactEmail } = useShop();

  return (
    <nav
      aria-label="Aide et confiance"
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1",
        className,
      )}
    >
      {NAV_REASSURANCE_DESKTOP.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="text-muted-foreground hover:text-tilouki-teal-dark text-xs font-medium whitespace-nowrap transition-colors"
        >
          {item.label}
        </Link>
      ))}
      <Link
        href={`mailto:${contactEmail}`}
        className="text-muted-foreground hover:text-tilouki-teal-dark text-xs font-medium whitespace-nowrap transition-colors"
      >
        Contact
      </Link>
      <Link
        href={NAV_HREF.favoris}
        className="text-tilouki-teal-dark text-xs font-semibold whitespace-nowrap sm:hidden"
      >
        Favoris
      </Link>
    </nav>
  );
}
