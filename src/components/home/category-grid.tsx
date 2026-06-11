import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Category } from "@/types/catalog";

const CATEGORY_ACCENTS = [
  "from-tilouki-blue-soft to-tilouki-blue/25 border-tilouki-blue/20",
  "from-tilouki-sage-light to-tilouki-sage/20 border-tilouki-sage/25",
  "from-tilouki-rose-soft to-tilouki-rose/25 border-tilouki-rose/20",
  "from-tilouki-cream to-tilouki-sand border-border/60",
  "from-tilouki-blue-soft/80 to-tilouki-sage-light border-tilouki-sage/20",
] as const;

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="border-y border-border/50 bg-card/40 py-10 md:py-12">
      <div className="container-tilouki">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Parcourir par catégorie</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Bébé, fille, garçon, pyjamas et accessoires.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="text-primary hidden items-center gap-1 text-sm font-semibold hover:underline sm:inline-flex"
          >
            Tout voir
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
          {categories.map((category, index) => {
            const accent = CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
            return (
              <Link
                key={category.id}
                href={`/categorie/${category.slug}`}
                className={`group flex min-h-[5.5rem] flex-col justify-between rounded-2xl border bg-gradient-to-br p-4 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-card)] sm:min-h-[6.5rem] sm:p-5 ${accent}`}
              >
                <div>
                  <p className="font-heading text-base font-semibold sm:text-lg">{category.name}</p>
                  {category.description ? (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs sm:text-sm">
                      {category.description}
                    </p>
                  ) : null}
                </div>
                <span className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-semibold sm:text-sm">
                  Découvrir
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
