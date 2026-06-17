import Image from "next/image";
import Link from "next/link";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { RitualCapsuleActions } from "@/components/rituals/ritual-capsule-actions";
import { RitualEmptyState } from "@/components/rituals/ritual-empty-state";
import { HOME_RITUAL_PRODUCT_LIMIT } from "@/lib/catalog/home-sections";
import { getRitualCapsuleHref } from "@/lib/rituals/ritual-capsule";
import type { CatalogueCapsuleModule } from "@/lib/rituals/catalogue-capsules";
import { resolveRitualTiloukiImage } from "@/lib/tilouki-images";

interface CatalogueCapsuleCardProps {
  module: CatalogueCapsuleModule;
}

export function CatalogueCapsuleCard({ module }: CatalogueCapsuleCardProps) {
  const { ritual, products } = module;
  const image = resolveRitualTiloukiImage(ritual.slug);
  const showcase = products.slice(0, HOME_RITUAL_PRODUCT_LIMIT);
  const hasProducts = showcase.length > 0;

  return (
    <article className="border-tilouki-border-subtle bg-tilouki-milk flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-soft)]">
      <Link
        href={getRitualCapsuleHref(ritual.slug)}
        className="group relative block aspect-[5/2] w-full overflow-hidden sm:aspect-[2/1]"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div
          className="from-tilouki-navy-dark/82 via-tilouki-navy/30 absolute inset-0 bg-gradient-to-t to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <p className="text-retail-label text-tilouki-vanille">Capsule</p>
          <h3 className="text-sm font-bold text-white sm:text-base">{ritual.title}</h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
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
            <RitualCapsuleActions ritual={ritual} products={showcase} />
          </>
        ) : (
          <RitualEmptyState ritual={ritual} className="mt-auto" />
        )}
      </div>
    </article>
  );
}
