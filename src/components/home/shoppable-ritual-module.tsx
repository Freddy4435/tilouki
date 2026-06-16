import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { RitualEmptyState } from "@/components/rituals/ritual-empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { HOME_RITUAL_PRODUCT_LIMIT } from "@/lib/catalog/home-sections";
import type { Ritual } from "@/lib/rituals/rituals";
import { resolveRitualTiloukiImage } from "@/lib/tilouki-images";
import type { ProductListItem } from "@/types/catalog";
import { cn } from "@/lib/utils";

export type ShoppableRitualLayout = "stack" | "split" | "banner";

interface ShoppableRitualModuleProps {
  ritual: Ritual;
  products: ProductListItem[];
  layout: ShoppableRitualLayout;
}

export function ShoppableRitualModule({
  ritual,
  products,
  layout,
}: ShoppableRitualModuleProps) {
  const image = resolveRitualTiloukiImage(ritual.slug);
  const ritualHref = `/rituels/${ritual.slug}`;
  const showcase = products.slice(0, HOME_RITUAL_PRODUCT_LIMIT);
  const hasProducts = showcase.length > 0;

  const imageLink = (
    <Link
      href={ritualHref}
      className={cn(
        "group relative block overflow-hidden",
        layout === "stack" && "aspect-[5/3] w-full sm:aspect-[2/1]",
        layout === "split" &&
          "aspect-[4/3] w-full md:aspect-auto md:min-h-[13rem] md:w-[38%] md:shrink-0",
        layout === "banner" && "aspect-[21/9] w-full sm:aspect-[3/1]",
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={
          layout === "split"
            ? "(max-width: 768px) 100vw, 38vw"
            : "(max-width: 640px) 100vw, 50vw"
        }
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div
        className="from-tilouki-navy-dark/80 via-tilouki-navy/35 absolute inset-0 bg-gradient-to-t to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <p className="text-retail-label text-white/85">{ritual.primaryCategoryLabel}</p>
        <p className="font-sans text-base font-semibold text-white sm:text-lg">
          {ritual.title}
        </p>
      </div>
    </Link>
  );

  const productsBlock = hasProducts ? (
    <div className="min-w-0 flex-1 space-y-3">
      <p className="text-muted-foreground text-xs sm:text-sm">{ritual.promise}</p>
      <CatalogueProductList
        products={showcase}
        layout="scroll-mobile"
        priorityLimit={0}
      />
      <p className="text-muted-foreground text-xs">{ritual.shoppingTip}</p>
    </div>
  ) : (
    <RitualEmptyState ritual={ritual} className="border-0 bg-transparent p-0 shadow-none" />
  );

  return (
    <article
      className={cn(
        "border-tilouki-border-subtle bg-tilouki-milk overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-soft)]",
        layout === "split" && "md:flex md:items-stretch",
        layout !== "split" && "flex flex-col",
      )}
    >
      {imageLink}
      <div
        className={cn(
          "flex flex-col gap-3 p-3 sm:p-4",
          layout === "split" && "md:flex-1 md:justify-center",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-muted-foreground line-clamp-2 min-w-0 text-sm leading-relaxed">
            {ritual.description}
          </p>
          <Link
            href={ritualHref}
            className="text-tilouki-navy inline-flex shrink-0 items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline sm:text-sm"
          >
            {ritual.ctaLabel}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        {productsBlock}
        {hasProducts ? (
          <ButtonLink href={ritual.catalogueHref} variant="outline" className="min-h-10 self-start">
            {ritual.ctaLabel}
            <ArrowRight className="size-4" />
          </ButtonLink>
        ) : null}
      </div>
    </article>
  );
}
