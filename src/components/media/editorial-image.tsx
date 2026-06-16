import Image, { type ImageProps } from "next/image";

import {
  getEditorialImage,
  type EditorialImageId,
} from "@/lib/media/editorial-images";
import { cn } from "@/lib/utils";

type EditorialImageProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  imageId: EditorialImageId;
  /** Surcharge déterministe (ex. héros blog résolu via tilouki-images). */
  src?: `/images/tilouki/${string}`;
  alt?: string;
  className?: string;
  imageClassName?: string;
};

/**
 * Image éditoriale locale (libre de droit) — jamais utilisée comme photo produit.
 */
export function EditorialImage({
  imageId,
  src: srcOverride,
  alt: altOverride,
  className,
  imageClassName,
  fill,
  priority,
  sizes,
  ...props
}: EditorialImageProps) {
  const base = getEditorialImage(imageId);
  const image = {
    ...base,
    ...(srcOverride ? { src: srcOverride } : {}),
    ...(altOverride ? { alt: altOverride } : {}),
  };

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
          {...props}
        />
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={cn(className, imageClassName)}
      {...props}
    />
  );
}
