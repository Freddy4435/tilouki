import { Droplets, Leaf, MapPin, Shirt, Sun } from "lucide-react";

import { deriveComfortNote } from "@/lib/catalog/product-page-content";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types/catalog";

interface ProductFactsProps {
  product: Pick<ProductDetail, "material" | "season" | "madeIn" | "careInstructions">;
  className?: string;
}

const ICON_CLASS = "text-tilouki-teal-dark size-4 shrink-0";

export function ProductFacts({ product, className }: ProductFactsProps) {
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
    product.madeIn
      ? {
          id: "origin",
          label: "Origine",
          value: product.madeIn,
          icon: MapPin,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "border-border/70 bg-card grid gap-3 rounded-[var(--radius-card)] border p-4 sm:grid-cols-2",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="flex gap-3">
            <Icon className={cn(ICON_CLASS, "mt-0.5")} aria-hidden />
            <div className="min-w-0">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm leading-snug font-medium whitespace-pre-line">
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
