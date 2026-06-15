import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductGalleryMainImageProps {
  src: string;
  alt: string;
  className?: string;
}

/** Image principale rendue côté serveur — cible LCP fiche produit. */
export function ProductGalleryMainImage({
  src,
  alt,
  className,
}: ProductGalleryMainImageProps) {
  return (
    <div
      className={cn(
        "product-image-frame relative min-h-[min(78vw,30rem)] flex-1 shadow-[var(--shadow-card)] lg:min-h-[34rem]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
        className="object-cover"
      />
    </div>
  );
}
