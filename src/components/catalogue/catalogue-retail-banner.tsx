import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { formatArticleCount } from "@/lib/catalog/catalogue-labels";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

interface CatalogueRetailBannerProps {
  title: string;
  productCount: number;
  image: { src: string; alt: string };
  eyebrow?: string;
  cta?: { label: string; href: string };
  className?: string;
}

/** Bandeau rayon compact — image Tilouki, titre, volume et action. */
export function CatalogueRetailBanner({
  title,
  productCount,
  image,
  eyebrow,
  cta,
  className,
}: CatalogueRetailBannerProps) {
  return (
    <div
      className={cn(
        "bg-card overflow-hidden rounded-[var(--radius-card)] border border-[var(--tilouki-border-subtle)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="grid min-h-[6.5rem] grid-cols-[minmax(0,1fr)_5.5rem] items-stretch sm:min-h-[7.5rem] sm:grid-cols-[minmax(0,1fr)_9rem] md:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="flex flex-col justify-center p-4 sm:p-5">
          {eyebrow ? (
            <p className="text-retail-label text-tilouki-pistache mb-1">{eyebrow}</p>
          ) : null}
          <h1 className="text-section-title text-tilouki-navy">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium tabular-nums">
            {formatArticleCount(productCount)}
          </p>
          {cta ? (
            <ButtonLink
              href={cta.href}
              variant="outline"
              size="sm"
              className="mt-3 w-fit rounded-full"
            >
              {cta.label}
              <ArrowRight className="size-3.5" aria-hidden />
            </ButtonLink>
          ) : null}
        </div>
        <div className="bg-tilouki-denim-soft/55 relative">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(max-width: 640px) 88px, 192px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
