import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Category } from "@/types/catalog";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="container-tilouki py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Catégories enfants</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Parcourez par âge, par style ou par besoin.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categorie/${category.slug}`}
            className="group bg-card hover:border-primary/30 flex items-center justify-between rounded-2xl border p-5 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-card)]"
          >
            <div>
              <p className="font-heading text-lg font-semibold">{category.name}</p>
              {category.description ? (
                <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
              ) : null}
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary size-5 shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
