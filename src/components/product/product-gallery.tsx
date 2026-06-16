"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { Camera, ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { filterCommercialProductImages } from "@/lib/catalog/product-sellability";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
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
      className="product-gallery-frame product-image-frame min-h-[min(72vw,28rem)] ring-1 ring-black/[0.04] lg:min-h-[32rem]"
      role="img"
      aria-label={`Photo produit en attente pour ${productName}`}
    >
      <div className="bg-tilouki-jade-soft/60 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="bg-card/90 flex size-14 items-center justify-center rounded-full shadow-sm">
          <Camera className="text-tilouki-teal-dark size-7" aria-hidden />
        </div>
        <div className="max-w-sm">
          <p className="text-foreground text-base font-semibold">Photos en préparation</p>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            Ce vêtement n&apos;est pas encore disponible à l&apos;achat. Dès que les
            photos réelles seront publiées, vous pourrez commander en toute confiance.
          </p>
        </div>
        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
          <ImageIcon className="size-3.5 opacity-60" aria-hidden />
          Visuels d&apos;ambiance non contractuels
        </p>
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
        "bg-tilouki-cloud relative shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-[var(--transition-fast)]",
        layout === "column" ? "aspect-[4/5] w-full" : "aspect-square w-full",
        active
          ? "border-tilouki-teal-dark ring-tilouki-teal-dark/15 shadow-sm ring-2"
          : "border-transparent opacity-75 hover:opacity-100",
      )}
    >
      <Image
        src={image.url}
        alt={thumbAlt}
        fill
        loading="lazy"
        sizes={layout === "column" ? IMAGE_SIZES.productThumbColumn : IMAGE_SIZES.productThumbRow}
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
  const commercialImages = useMemo(
    () => filterCommercialProductImages(images),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const active = commercialImages[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (commercialImages.length === 0) return;
      setActiveIndex(Math.max(0, Math.min(commercialImages.length - 1, index)));
    },
    [commercialImages.length],
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
    if (touchStartX.current === null || commercialImages.length <= 1) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      goTo(activeIndex + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  if (!sellable || commercialImages.length === 0) {
    return <GalleryPlaceholder productName={productName} />;
  }

  return (
    <div className="space-y-3">
      <div className="lg:flex lg:items-start lg:gap-3">
        {commercialImages.length > 1 ? (
          <div
            className="scrollbar-hide hidden max-h-[32rem] w-20 shrink-0 flex-col gap-2 overflow-y-auto lg:flex"
            role="tablist"
            aria-label={`Miniatures — ${productName}`}
          >
            {commercialImages.map((image, index) => (
              <ThumbnailButton
                key={image.id}
                image={image}
                index={index}
                total={commercialImages.length}
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
          className="product-gallery-frame product-image-frame min-h-[min(78vw,30rem)] flex-1 ring-1 ring-black/[0.04] lg:min-h-[32rem]"
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
            sizes={IMAGE_SIZES.productMain}
            className={cn(
              "object-cover transition-transform duration-[var(--transition-base)]",
              isZooming && "scale-[1.45] max-md:scale-100",
            )}
            style={
              isZooming
                ? { transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }
                : undefined
            }
          />

          {showLowStockBadge ? (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-card/95 text-tilouki-persimmon-dark border-tilouki-persimmon/20 border shadow-sm backdrop-blur-sm">
                Dernières pièces
              </Badge>
            </div>
          ) : null}

          {commercialImages.length > 1 ? (
            <p className="text-muted-foreground bg-card/92 absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums backdrop-blur-sm lg:hidden">
              {activeIndex + 1} / {commercialImages.length}
            </p>
          ) : null}
        </div>
      </div>

      {commercialImages.length > 1 ? (
        <div
          className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5 lg:hidden"
          role="tablist"
          aria-label={`Photos de ${productName}`}
        >
          {commercialImages.map((image, index) => (
            <div key={image.id} className="w-[4.25rem] shrink-0">
              <ThumbnailButton
                image={image}
                index={index}
                total={commercialImages.length}
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
