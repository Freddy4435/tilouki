"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { useShop } from "@/components/providers/shop-provider";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  /** Masqué par défaut : le fichier logo inclut déjà « Tilouki.fr ». */
  showName?: boolean;
  priority?: boolean;
}

export function SiteLogo({
  className,
  showName = false,
  priority = false,
}: SiteLogoProps) {
  const { name } = useShop();

  return (
    <Link
      href="/"
      className={cn("group flex min-w-0 items-center gap-2.5", className)}
      aria-label={`${name} — accueil`}
    >
      <BrandLogo
        variant="header"
        priority={priority}
        alt={`${name} — vêtements enfants`}
        className="transition-transform group-hover:scale-[1.02]"
      />
      {showName ? (
        <span className="font-display sr-only sm:not-sr-only sm:truncate sm:text-xl sm:font-semibold sm:tracking-tight">
          {name}
        </span>
      ) : null}
    </Link>
  );
}
