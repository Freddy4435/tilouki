"use client";

import type { CSSProperties } from "react";

import { EditorialImage } from "@/components/media/editorial-image";
import type { EditorialImageId } from "@/lib/media/editorial-images";
import { ritualViewTransitionName } from "@/lib/motion/view-transition";

interface RitualHeroImageProps {
  slug: string;
  imageId: EditorialImageId;
  priority?: boolean;
}

export function RitualHeroImage({ slug, imageId, priority }: RitualHeroImageProps) {
  const transitionStyle = {
    viewTransitionName: ritualViewTransitionName(slug),
  } satisfies CSSProperties;

  return (
    <div className="absolute inset-0" style={transitionStyle}>
      <EditorialImage
        imageId={imageId}
        fill
        priority={priority}
        sizes="100vw"
        className="h-full w-full"
      />
    </div>
  );
}
