"use client";

import type { CSSProperties } from "react";

import { EditorialImage } from "@/components/media/editorial-image";
import type { EditorialImageId } from "@/lib/media/editorial-images";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import { ritualViewTransitionName } from "@/lib/motion/view-transition";
import { resolveRitualTiloukiImage } from "@/lib/tilouki-images";

interface RitualHeroImageProps {
  slug: string;
  imageId: EditorialImageId;
  priority?: boolean;
}

export function RitualHeroImage({ slug, imageId, priority }: RitualHeroImageProps) {
  const transitionStyle = {
    viewTransitionName: ritualViewTransitionName(slug),
  } satisfies CSSProperties;
  const ritualImage = resolveRitualTiloukiImage(slug);

  return (
    <div className="absolute inset-0" style={transitionStyle}>
      <EditorialImage
        imageId={imageId}
        src={ritualImage.src}
        alt={ritualImage.alt}
        fill
        priority={priority}
        sizes={IMAGE_SIZES.hero}
        className="h-full w-full"
      />
    </div>
  );
}
