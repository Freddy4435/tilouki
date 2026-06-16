import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HOME_RAYONS } from "@/lib/catalog/home-sections";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import {
  resolveEditorialModuleTiloukiImage,
  resolveQuickAccessTiloukiImage,
} from "@/lib/tilouki-images";
import { cn } from "@/lib/utils";

const RAYON_LAYOUT_CLASS: Record<(typeof HOME_RAYONS)[number]["layout"], string> = {
  featured: "col-span-2 row-span-2 min-h-[9.5rem] sm:min-h-[11rem]",
  tile: "min-h-[7rem] sm:min-h-[8.5rem]",
  promo:
    "col-span-2 min-h-[6.5rem] border-tilouki-persimmon/25 ring-tilouki-persimmon/15 sm:min-h-[7.5rem]",
};

function resolveRayonImage(rayon: (typeof HOME_RAYONS)[number]) {
  if ("imageModuleId" in rayon) {
    return resolveEditorialModuleTiloukiImage(rayon.imageModuleId);
  }
  return resolveQuickAccessTiloukiImage(rayon.imageSlug);
}

export function CategoryGrid() {
  return (
    <section
      id="home-rayons"
      className="retail-section border-tilouki-border/80 bg-tilouki-milk scroll-mt-20 border-y py-8 md:py-10"
      aria-labelledby="home-rayons-title"
    >
      <div className="container-tilouki">
        <header className="retail-section__header mb-5 max-w-2xl">
          <div className="brand-accent-bar" aria-hidden />
          <p className="text-retail-label text-tilouki-brand-blue">Rayons</p>
          <h2
            id="home-rayons-title"
            className="text-section-title retail-section__title"
          >
            Choisir par univers
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Bébé, fille, garçon, pyjamas ou petits prix — stock et tailles sur chaque
            fiche.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {HOME_RAYONS.map((rayon) => {
            const image = resolveRayonImage(rayon);
            const isPromo = rayon.layout === "promo";

            return (
              <Link
                key={rayon.id}
                href={rayon.href}
                className={cn(
                  "group relative flex flex-col justify-end overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-shadow hover:shadow-[var(--shadow-card)]",
                  RAYON_LAYOUT_CLASS[rayon.layout],
                  isPromo && "bg-tilouki-persimmon-soft/40",
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  sizes={
                    rayon.layout === "featured"
                      ? IMAGE_SIZES.categoryFeatured
                      : IMAGE_SIZES.categoryTile
                  }
                  className={cn(
                    "object-cover transition-transform duration-500 group-hover:scale-105",
                    isPromo && "opacity-90",
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t to-transparent",
                    isPromo
                      ? "from-tilouki-persimmon-dark/85 via-tilouki-persimmon-dark/35"
                      : "from-tilouki-ink/75 via-tilouki-ink/25",
                  )}
                  aria-hidden
                />
                <div className="relative p-3 sm:p-4">
                  <p
                    className={cn(
                      "text-base font-bold text-white sm:text-lg",
                      isPromo && "text-tilouki-milk",
                    )}
                  >
                    {rayon.label}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-white/88">
                    {rayon.description}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/92">
                    Voir le rayon
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 text-center sm:text-left">
          <Link
            href="/catalogue"
            className="text-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            Tout le catalogue
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
