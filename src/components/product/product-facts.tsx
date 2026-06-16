import { Droplets, Leaf, Shirt, Sparkles, Sun } from "lucide-react";

import { deriveComfortNote } from "@/lib/catalog/product-page-content";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types/catalog";

interface ProductFactsProps {
  product: Pick<ProductDetail, "material" | "season" | "madeIn" | "careInstructions">;
  className?: string;
  /** Titre de section visible (fiche produit parent-friendly). */
  showTitle?: boolean;
}

const ICON_CLASS = "text-tilouki-teal-dark size-4 shrink-0";

export function ProductFacts({
  product,
  className,
  showTitle = false,
}: ProductFactsProps) {
  const comfort = deriveComfortNote(product.material);

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
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        "border-tilouki-jade/20 bg-tilouki-cloud/40 rounded-[var(--radius-card)] border p-4 sm:p-5",
        className,
      )}
      aria-labelledby={showTitle ? "product-practical-heading" : undefined}
    >
      {showTitle ? (
        <header className="mb-4 flex items-start gap-2">
          <Sparkles className="text-tilouki-teal-dark mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <h2 id="product-practical-heading" className="text-base font-semibold">
              Pourquoi ce vêtement est pratique
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              L&apos;essentiel pour décider vite — matière, entretien et confort.
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
              className="bg-card/80 flex gap-3 rounded-[var(--radius-button)] border border-[var(--tilouki-border-subtle)] p-3"
            >
              <Icon className={cn(ICON_CLASS, "mt-0.5")} aria-hidden />
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
