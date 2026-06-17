import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatArticleCount } from "@/lib/catalog/catalogue-labels";
import { buildCategoryHref } from "@/lib/navigation/catalog-href";
import { resolveCategoryTiloukiImage } from "@/lib/tilouki-images";
import type { Category } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface CatalogueRayonsViewProps {
  categories: Category[];
  productCounts: Record<string, number>;
  /** Rayon mis en avant (page catégorie). */
  highlightSlug?: string;
}

export function CatalogueRayonsView({
  categories,
  productCounts,
  highlightSlug,
}: CatalogueRayonsViewProps) {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
      {sorted.map((category) => {
        const image = resolveCategoryTiloukiImage(category.slug);
        const count = productCounts[category.slug] ?? 0;
        const highlighted = highlightSlug === category.slug;

        return (
          <Link
            key={category.id}
            href={buildCategoryHref(category.slug)}
            className={cn(
              "group relative flex min-h-[8.5rem] flex-col justify-end overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-shadow hover:shadow-[var(--shadow-card)] sm:min-h-[10rem]",
              highlighted && "ring-tilouki-denim/40 ring-2",
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className="from-tilouki-ink/78 via-tilouki-ink/28 absolute inset-0 bg-gradient-to-t to-transparent"
              aria-hidden
            />
            <div className="relative p-3 sm:p-4">
              <p className="text-sm font-bold text-white sm:text-base">
                {category.name}
              </p>
              <p className="mt-0.5 text-xs text-white/88 tabular-nums">
                {formatArticleCount(count)}
              </p>
              {category.description ? (
                <p className="mt-1 line-clamp-2 text-xs text-white/80">
                  {category.description}
                </p>
              ) : null}
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/92">
                Voir le rayon
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
