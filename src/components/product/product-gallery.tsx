"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** true si au moins une variante en stock a ≤ 2 exemplaires */
  showLowStockBadge?: boolean;
}

export function ProductGallery({
  images,
  productName,
  showLowStockBadge = false,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const active = images[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      setActiveIndex(Math.max(0, Math.min(images.length - 1, index)));
    },
    [images.length],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || images.length <= 1) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      goTo(activeIndex + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  if (images.length === 0) {
    return (
      <div
        className="product-image-frame shadow-[var(--shadow-card)]"
        role="img"
        aria-label={`Aucune photo disponible pour ${productName}`}
      >
        <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
          <ImageIcon className="size-10 opacity-40" aria-hidden />
          <span className="text-sm">Photo à venir</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        id="product-gallery-main"
        className="product-image-frame shadow-[var(--shadow-card)]"
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsZooming(true)}
        onPointerLeave={() => setIsZooming(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={active.url}
          alt={active.alt ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-[var(--transition-base)]",
            isZooming && "scale-[1.65] max-md:scale-100",
          )}
          style={
            isZooming
              ? { transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }
              : undefined
          }
        />

        {showLowStockBadge ? (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-tilouki-rose text-tilouki-ink border-0 shadow-[var(--shadow-soft)]">
              Dernières pièces
            </Badge>
          </div>
        ) : null}

        {images.length > 1 ? (
          <p className="text-muted-foreground absolute right-3 bottom-3 rounded-full bg-card/90 px-2 py-0.5 text-xs font-medium backdrop-blur-sm md:hidden">
            {activeIndex + 1} / {images.length}
          </p>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div
          className="grid grid-cols-4 gap-2 sm:grid-cols-5"
          role="tablist"
          aria-label={`Photos de ${productName}`}
        >
          {images.map((image, index) => {
            const thumbAlt =
              image.alt ?? `${productName} — vue ${index + 1} sur ${images.length}`;

            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-controls="product-gallery-main"
                onClick={() => goTo(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors duration-[var(--transition-fast)]",
                  index === activeIndex ? "border-primary" : "border-transparent",
                )}
              >
                <Image
                  src={image.url}
                  alt={thumbAlt}
                  fill
                  loading="lazy"
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
