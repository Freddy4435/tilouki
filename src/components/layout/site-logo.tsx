"use client";

import Link from "next/link";

import { useShop } from "@/components/providers/shop-provider";
import { getShopInitial } from "@/lib/shop/theme";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  showName?: boolean;
}

export function SiteLogo({ className, showName = true }: SiteLogoProps) {
  const { name } = useShop();
  const initial = getShopInitial(name);

  return (
    <Link href="/" className={cn("group flex min-w-0 items-center gap-2.5", className)}>
      <span
        className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-[var(--shadow-soft)] transition-transform group-hover:scale-[1.02]"
        aria-hidden
      >
        {initial}
      </span>
      {showName ? (
        <span className="font-display truncate text-xl font-semibold tracking-tight">
          {name}
        </span>
      ) : null}
    </Link>
  );
}
