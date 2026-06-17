import Image from "next/image";
import Link from "next/link";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { RitualCapsuleActions } from "@/components/rituals/ritual-capsule-actions";
import { RitualEmptyState } from "@/components/rituals/ritual-empty-state";
import { HOME_RITUAL_PRODUCT_LIMIT } from "@/lib/catalog/home-sections";
import { getRitualCapsuleHref } from "@/lib/rituals/ritual-capsule";
import type { Ritual } from "@/lib/rituals/rituals";
import { resolveRitualTiloukiImage } from "@/lib/tilouki-images";
import type { ProductListItem } from "@/types/catalog";

interface ShoppableRitualModuleProps {
  ritual: Ritual;
  products: ProductListItem[];
}

export function ShoppableRitualModule({
  ritual,
  products,
}: ShoppableRitualModuleProps) {
  const image = resolveRitualTiloukiImage(ritual.slug);
  const ritualHref = getRitualCapsuleHref(ritual.slug);
  const showcase = products.slice(0, HOME_RITUAL_PRODUCT_LIMIT);
  const hasProducts = showcase.length > 0;

  return (
    <article className="border-tilouki-border-subtle bg-tilouki-milk overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-soft)] md:flex md:items-stretch">
      <Link
        href={ritualHref}
        className="group relative block aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[13rem] md:w-[38%] md:shrink-0"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 38vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div
          className="from-tilouki-navy-dark/82 via-tilouki-navy/32 absolute inset-0 bg-gradient-to-t to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <p className="text-retail-label text-white/85">Capsule</p>
          <p className="font-sans text-sm font-semibold text-white sm:text-base">
            {ritual.title}
          </p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4 md:justify-center">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {ritual.promise}
        </p>

        {hasProducts ? (
          <>
            <CatalogueProductList
              products={showcase}
              layout="scroll-mobile"
              priorityLimit={0}
            />
            <p className="text-muted-foreground text-xs">{ritual.shoppingTip}</p>
            <RitualCapsuleActions ritual={ritual} products={showcase} />
          </>
        ) : (
          <RitualEmptyState ritual={ritual} />
        )}
      </div>
    </article>
  );
}
