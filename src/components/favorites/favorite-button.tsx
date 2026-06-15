"use client";

import { useCallback, useState } from "react";
import { Heart } from "lucide-react";

import { useFavoritesStore } from "@/lib/favorites/store";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  slug: string;
  className?: string;
}

export function FavoriteButton({ slug, className }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.slugs.includes(slug));
  const toggle = useFavoritesStore((state) => state.toggle);
  const [pulse, setPulse] = useState(false);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      toggle(slug);
      setPulse(true);
      window.setTimeout(() => setPulse(false), 280);
    },
    [slug, toggle],
  );

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={handleClick}
      className={cn(
        "bg-card/90 text-foreground hover:bg-card focus-visible:ring-primary absolute top-2 right-2 z-20 flex size-9 items-center justify-center rounded-full shadow-sm ring-1 ring-black/[0.06] backdrop-blur-sm transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:outline-none active:scale-95",
        isFavorite && "text-primary",
        pulse && "scale-110",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-[18px] transition-[fill,color] duration-200",
          isFavorite && "fill-current",
        )}
        aria-hidden
      />
    </button>
  );
}
