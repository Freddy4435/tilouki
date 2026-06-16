"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

import {
  ritualViewTransitionName,
  runViewTransition,
} from "@/lib/motion/view-transition";
import type { Ritual } from "@/lib/rituals/rituals";
import { resolveRitualTiloukiImage } from "@/lib/tilouki-images";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";

interface RitualCardProps {
  ritual: Ritual;
}

export function RitualCard({ ritual }: RitualCardProps) {
  const router = useRouter();
  const href = `/rituels/${ritual.slug}`;
  const ritualImage = resolveRitualTiloukiImage(ritual.slug);
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
      className="group bg-card border-tilouki-jade/15 flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-[var(--motion-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={transitionStyle}>
        <Image
          src={ritualImage.src}
          alt={ritualImage.alt}
          fill
          sizes={IMAGE_SIZES.editorialCard}
          className="object-cover transition-transform duration-[var(--motion-base)] group-hover:scale-[1.02]"
        />
        <div
          className="from-tilouki-navy-dark/75 absolute inset-0 bg-gradient-to-t to-transparent"
          aria-hidden
        />
        <p className="text-retail-label absolute top-3 left-3 text-white/90">
          {ritual.primaryCategoryLabel}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-sans text-base font-semibold">{ritual.title}</h3>
        <p className="text-muted-foreground line-clamp-2 flex-1 text-sm leading-relaxed">
          {ritual.promise}
        </p>
        <span className="text-tilouki-teal-dark inline-flex items-center gap-1 text-xs font-semibold">
          {ritual.ctaLabel}
          <ArrowRight
            className="size-3.5 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
