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
  sellable?: boolean;
}

function GalleryPlaceholder({ productName }: { productName: string }) {
  return (
    <div
      className="product-image-frame min-h-[min(72vw,28rem)] shadow-[var(--shadow-card)] lg:min-h-[34rem]"
      role="img"
      aria-label={`Illustration en cours pour ${productName}`}
    >
      <div className="bg-tilouki-jade-soft flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <ImageIcon className="text-muted-foreground size-12 opacity-35" aria-hidden />
        <div>
          <p className="text-foreground text-base font-semibold">
            Illustration en préparation
          </p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Ce produit n&apos;est pas encore disponible à l&apos;achat en ligne.
          </p>
        </div>
      </div>
    </div>
  );
}

function ThumbnailButton({
  image,
  index,
  total,
  productName,
  active,
  onSelect,
  layout,
}: {
  image: ProductImage;
  index: number;
  total: number;
  productName: string;
  active: boolean;
  onSelect: () => void;
  layout: "row" | "column";
}) {
  const thumbAlt = image.alt ?? `${productName} — vue ${index + 1} sur ${total}`;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls="product-gallery-main"
      onClick={onSelect}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[var(--radius-button)] border-2 transition-colors duration-[var(--transition-fast)]",
        layout === "column" ? "aspect-[4/5] w-full" : "aspect-square w-full",
        active
          ? "border-primary ring-primary/20 ring-1"
          : "border-transparent opacity-80 hover:opacity-100",
      )}
    >
      <Image
        src={image.url}
        alt={thumbAlt}
        fill
        loading="lazy"
        sizes={layout === "column" ? "96px" : "80px"}
        className="object-cover"
      />
    </button>
  );
}

export function ProductGallery({
  images,
  productName,
  showLowStockBadge = false,
  sellable = true,
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

  if (!sellable || images.length === 0) {
    return <GalleryPlaceholder productName={productName} />;
  }

  return (
    <div className="space-y-3">
      <div className="lg:flex lg:items-start lg:gap-3">
        {images.length > 1 ? (
          <div
            className="scrollbar-hide hidden max-h-[34rem] w-[4.75rem] shrink-0 flex-col gap-2 overflow-y-auto lg:flex"
            role="tablist"
            aria-label={`Miniatures — ${productName}`}
          >
            {images.map((image, index) => (
              <ThumbnailButton
                key={image.id}
                image={image}
                index={index}
                total={images.length}
                productName={productName}
                active={index === activeIndex}
                onSelect={() => goTo(index)}
                layout="column"
              />
            ))}
          </div>
        ) : null}

        <div
          id="product-gallery-main"
          className="product-image-frame min-h-[min(78vw,30rem)] flex-1 shadow-[var(--shadow-card)] lg:min-h-[34rem]"
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
            fetchPriority="high"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
            className={cn(
              "object-cover transition-transform duration-[var(--transition-base)]",
              isZooming && "scale-[1.55] max-md:scale-100",
            )}
            style={
              isZooming
                ? { transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }
                : undefined
            }
          />

          {showLowStockBadge ? (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-tilouki-persimmon-soft text-tilouki-persimmon-dark border-tilouki-persimmon/20 border shadow-[var(--shadow-soft)]">
                Dernières pièces
              </Badge>
            </div>
          ) : null}

          {images.length > 1 ? (
            <p className="text-muted-foreground bg-card/92 absolute right-3 bottom-3 rounded-[var(--radius-button)] px-2.5 py-1 text-xs font-medium backdrop-blur-sm lg:hidden">
              {activeIndex + 1} / {images.length}
            </p>
          ) : null}
        </div>
      </div>

      {images.length > 1 ? (
        <div
          className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden"
          role="tablist"
          aria-label={`Photos de ${productName}`}
        >
          {images.map((image, index) => (
            <div key={image.id} className="w-[4.5rem] shrink-0">
              <ThumbnailButton
                image={image}
                index={index}
                total={images.length}
                productName={productName}
                active={index === activeIndex}
                onSelect={() => goTo(index)}
                layout="row"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
