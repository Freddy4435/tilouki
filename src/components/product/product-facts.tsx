import { Droplets, Hand, Leaf, Shirt, Sparkles, Sun } from "lucide-react";

import {
  deriveChildAutonomyNote,
  deriveComfortNote,
} from "@/lib/catalog/product-page-content";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types/catalog";

interface ProductFactsProps {
  product: Pick<
    ProductDetail,
    | "name"
    | "categorySlug"
    | "material"
    | "season"
    | "madeIn"
    | "careInstructions"
  >;
  className?: string;
  /** Titre de section visible (fiche produit parent-friendly). */
  showTitle?: boolean;
}

const ICON_WRAP =
  "bg-tilouki-pistache-soft/70 text-tilouki-navy flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-button)]";

export function ProductFacts({
  product,
  className,
  showTitle = false,
}: ProductFactsProps) {
  const comfort = deriveComfortNote(product.material);
  const autonomy = deriveChildAutonomyNote({
    name: product.name,
    categorySlug: product.categorySlug,
    material: product.material,
    careInstructions: product.careInstructions,
  });

  const items = [
    product.material
      ? {
          id: "material",
          label: "Matière",
          value: product.material,
          icon: Shirt,
        }
      : null,
    comfort
      ? {
          id: "comfort",
          label: "Confort",
          value: comfort,
          icon: Leaf,
        }
      : null,
    product.season
      ? {
          id: "season",
          label: "Saison",
          value: product.season,
          icon: Sun,
        }
      : null,
    product.careInstructions
      ? {
          id: "care",
          label: "Entretien",
          value: product.careInstructions,
          icon: Droplets,
        }
      : null,
    autonomy
      ? {
          id: "autonomy",
          label: "Autonomie enfant",
          value: autonomy,
          icon: Hand,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        "border-tilouki-pistache/20 from-tilouki-cloud/60 to-tilouki-milk rounded-[var(--radius-card)] border bg-gradient-to-br p-4 sm:p-5",
        className,
      )}
      aria-labelledby={showTitle ? "product-practical-heading" : undefined}
    >
      {showTitle ? (
        <header className="mb-4 flex items-start gap-3">
          <span className={ICON_WRAP} aria-hidden>
            <Sparkles className="size-4" />
          </span>
          <div>
            <h2 id="product-practical-heading" className="text-base font-semibold">
              Pourquoi cette pièce est pratique
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Matière, entretien et confort — l&apos;essentiel pour décider vite.
            </p>
          </div>
        </header>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className="bg-card/90 flex gap-3 rounded-[var(--radius-button)] border border-[var(--tilouki-border-subtle)] p-3 shadow-[var(--shadow-soft)]"
            >
              <span className={ICON_WRAP} aria-hidden>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm leading-snug font-medium">{item.value}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
