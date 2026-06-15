"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { FavoritesBadge } from "@/components/favorites/favorites-badge";
import { buttonVariants } from "@/components/ui/button";
import { buildFavoritesAriaLabel } from "@/lib/favorites/display";
import { useFavoritesStore } from "@/lib/favorites/store";
import { cn } from "@/lib/utils";

export function FavoritesTrigger() {
  const count = useFavoritesStore((state) => state.slugs.length);

  return (
    <Link
      href="/favoris"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative shrink-0",
      )}
      aria-label={buildFavoritesAriaLabel(count)}
    >
      <Heart className="size-5" aria-hidden />
      <FavoritesBadge />
    </Link>
  );
}
