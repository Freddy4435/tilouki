"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [feedback, setFeedback] = useState<"added" | "removed" | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current != null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const added = toggle(slug);
      setFeedback(added ? "added" : "removed");
      if (feedbackTimerRef.current != null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = window.setTimeout(() => setFeedback(null), 2200);
    },
    [slug, toggle],
  );

  return (
    <div className={cn("absolute top-2 right-2 z-20", className)}>
      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        onClick={handleClick}
        className={cn(
          "bg-card/90 text-foreground hover:bg-card focus-visible:ring-primary relative flex size-9 items-center justify-center rounded-full shadow-sm ring-1 ring-black/[0.06] backdrop-blur-sm transition-[background-color,transform] duration-[var(--motion-fast)] hover:scale-105 focus-visible:ring-2 focus-visible:outline-none active:scale-95",
          isFavorite && "text-primary",
          feedback === "added" && "tilouki-motion-heart-pop",
        )}
      >
        <Heart
          className={cn(
            "size-[18px] transition-[fill,color] duration-[var(--motion-fast)]",
            isFavorite && "fill-current",
          )}
          aria-hidden
        />
      </button>
      <p
        className={cn(
          "bg-tilouki-ink/80 pointer-events-none absolute top-full right-0 mt-1.5 max-w-[9.5rem] rounded-full px-2.5 py-1 text-center text-[10px] font-medium text-white shadow-sm transition-opacity duration-[var(--motion-base)]",
          feedback ? "tilouki-motion-soft-in opacity-100" : "opacity-0",
        )}
        role="status"
        aria-live="polite"
      >
        {feedback === "added"
          ? "Ajouté à vos coups de cœur"
          : feedback === "removed"
            ? "Retiré des favoris"
            : ""}
      </p>
    </div>
  );
}
