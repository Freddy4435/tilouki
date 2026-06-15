"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";

import { EditorialImage } from "@/components/media/editorial-image";
import type { EditorialImageId } from "@/lib/media/editorial-images";
import { cn } from "@/lib/utils";

export interface MaterialCardData {
  id: string;
  name: string;
  feel: string;
  tip: string;
  imageId: EditorialImageId;
  blogHref: string;
}

interface MaterialCardProps {
  material: MaterialCardData;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const [tipRevealed, setTipRevealed] = useState(false);

  const toggleTip = useCallback(() => {
    setTipRevealed((current) => !current);
  }, []);

  return (
    <article className="material-card-group group bg-card flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-tilouki-jade/12 shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-[var(--motion-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <div className="relative">
        <EditorialImage
          imageId={material.imageId}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="aspect-square transition-transform duration-[var(--motion-base)] group-hover:scale-[1.02]"
        />
        <div
          className={cn(
            "material-card-tip from-tilouki-ink/55 pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t to-transparent p-4",
          )}
          data-revealed={tipRevealed ? "true" : "false"}
        >
          <p className="text-sm leading-snug font-medium text-white">{material.tip}</p>
        </div>
        <button
          type="button"
          className="text-tilouki-teal-dark absolute right-2 bottom-2 z-10 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm sm:hidden"
          onClick={toggleTip}
          aria-expanded={tipRevealed}
          aria-label={tipRevealed ? "Masquer le conseil matière" : "Voir un conseil matière"}
        >
          {tipRevealed ? "Fermer" : "Conseil"}
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-base font-semibold">{material.name}</h3>
        <p className="text-muted-foreground flex-1 text-sm leading-relaxed">{material.feel}</p>
        <Link
          href={material.blogHref}
          className="text-tilouki-teal-dark inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline"
        >
          Lire sur le carnet
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
