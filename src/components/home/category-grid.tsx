import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EditorialSurface } from "@/components/home/editorial-surface";
import { isRealEditorialImage } from "@/lib/editorial/images";
import { resolveUniverseEditorialImage } from "@/lib/media/editorial-images";
import type { Category } from "@/types/catalog";

const SURFACE_TONES = ["jade", "powder", "cloud", "butter", "teal", "teal"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  bebe: "Premiers mois",
  fille: "Fille",
  garcon: "Garçon",
  pyjamas: "Nuit douce",
  accessoires: "Petits extras",
};

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="border-border/40 bg-tilouki-milk border-y py-8 md:py-10">
      <div className="container-tilouki">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="brand-accent-bar mb-2" aria-hidden />
            <p className="text-retail-label text-tilouki-brand-blue mb-1">Nos univers</p>
            <h2 className="text-section-title text-tilouki-navy">Par où commencer ?</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Bébé, fille, garçon, pyjamas… Choisissez l&apos;univers qui vous
              correspond aujourd&apos;hui.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="text-primary hidden items-center gap-1 text-sm font-semibold hover:underline sm:inline-flex"
          >
            Tout le catalogue
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {categories.map((category, index) => {
            const editorialFallback = resolveUniverseEditorialImage(category.slug);
            const imageSrc = isRealEditorialImage(category.imageUrl)
              ? category.imageUrl!
              : (editorialFallback?.src ?? null);
            const hasPhoto = Boolean(imageSrc);
            const tone = SURFACE_TONES[index % SURFACE_TONES.length];

            return (
              <Link
                key={category.id}
                href={`/categorie/${category.slug}`}
                className="group bg-tilouki-jade-soft relative flex min-h-[7rem] flex-col justify-end overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-shadow hover:shadow-[var(--shadow-card)] sm:min-h-[8.5rem]"
              >
                {hasPhoto ? (
                  <Image
                    src={imageSrc!}
                    alt={editorialFallback?.alt ?? category.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 45vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <EditorialSurface
                    label={CATEGORY_LABELS[category.slug] ?? category.name}
                    title={category.name}
                    tone={tone}
                    className="absolute inset-0 min-h-full items-center justify-center text-center"
                  />
                )}
                <div className="from-tilouki-ink/75 via-tilouki-ink/25 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="relative p-3 sm:p-4">
                  <p className="text-base font-bold text-white sm:text-lg">
                    {category.name}
                  </p>
                  {category.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-white/85">
                      {category.description}
                    </p>
                  ) : null}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
                    Découvrir
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
