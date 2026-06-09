"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

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
      <div id="product-gallery-main" className="product-image-frame shadow-[var(--shadow-card)]">
        <Image
          src={active.url}
          alt={active.alt ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div
          className="grid grid-cols-4 gap-2 sm:grid-cols-5"
          role="tablist"
          aria-label={`Photos de ${productName}`}
        >
          {images.map((image, index) => {
            const thumbAlt =
              image.alt ??
              `${productName} — vue ${index + 1} sur ${images.length}`;

            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-controls="product-gallery-main"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
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
