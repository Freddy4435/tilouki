import Image from "next/image";

import { ProductPhotoSignal } from "@/components/product/product-photo-signal";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import { cn } from "@/lib/utils";

interface ProductGalleryMainImageProps {
  src: string;
  alt: string;
  className?: string;
  commercialCount?: number;
  secondHand?: boolean;
  defects?: string[];
}

/** Image principale rendue côté serveur — cible LCP fiche produit. */
export function ProductGalleryMainImage({
  src,
  alt,
  className,
  commercialCount = 1,
  secondHand = false,
  defects = [],
}: ProductGalleryMainImageProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "product-gallery-frame product-image-frame relative min-h-[min(78vw,30rem)] flex-1 ring-1 ring-black/[0.04] lg:min-h-[32rem]",
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          sizes={IMAGE_SIZES.productMain}
          className="object-cover"
        />
      </div>
      <ProductPhotoSignal
        commercialCount={commercialCount}
        secondHand={secondHand}
        defects={defects}
      />
    </div>
  );
}
