"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

import { EditorialImage } from "@/components/media/editorial-image";
import {
  ritualViewTransitionName,
  runViewTransition,
} from "@/lib/motion/view-transition";
import type { Ritual } from "@/lib/rituals/rituals";

interface RitualCardProps {
  ritual: Ritual;
}

export function RitualCard({ ritual }: RitualCardProps) {
  const router = useRouter();
  const href = `/rituels/${ritual.slug}`;
  const transitionStyle = {
    viewTransitionName: ritualViewTransitionName(ritual.slug),
  } satisfies CSSProperties;

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        runViewTransition(() => {
          router.push(href);
        });
      }}
      className="group bg-card flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-tilouki-jade/15 shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-[var(--motion-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative overflow-hidden" style={transitionStyle}>
        <EditorialImage
          imageId={ritual.imageId}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 20vw"
          className="aspect-[4/3] transition-transform duration-[var(--motion-base)] group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold">{ritual.title}</h3>
        <p className="text-muted-foreground line-clamp-3 flex-1 text-sm leading-relaxed">
          {ritual.description}
        </p>
        <span className="text-tilouki-teal-dark inline-flex items-center gap-1 text-xs font-semibold">
          Entrer dans le moment
          <ArrowRight
            className="size-3.5 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
