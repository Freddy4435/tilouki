"use client";

import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatFavoritesCount } from "@/lib/favorites/display";
import { useFavoritesStore } from "@/lib/favorites/store";
import { cn } from "@/lib/utils";

interface FavoritesBadgeProps {
  className?: string;
}

export function FavoritesBadge({ className }: FavoritesBadgeProps) {
  const mounted = useIsMounted();
  const count = useFavoritesStore((state) => state.slugs.length);
  const label = formatFavoritesCount(count);

  if (!mounted || !label) return null;

  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
        className,
      )}
    >
      {label}
    </span>
  );
}
