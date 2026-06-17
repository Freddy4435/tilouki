"use client";

import Link from "next/link";
import { Ruler } from "lucide-react";

import { resolveVariantSizeAdvice } from "@/lib/catalog/product-page-content";
import type { ProductGender } from "@/types/database";
import { cn } from "@/lib/utils";

interface ProductCompactSizeGuideProps {
  selectedVariant: {
    sizeLabel: string | null;
    ageLabel: string | null;
  } | null;
  sizes: string[];
  ageLabels: string[];
  gender: ProductGender;
  material: string | null;
  secondHand?: boolean;
  className?: string;
}

export function ProductCompactSizeGuide({
  selectedVariant,
  sizes,
  ageLabels,
  gender,
  material,
  secondHand = false,
  className,
}: ProductCompactSizeGuideProps) {
  const advice = resolveVariantSizeAdvice(selectedVariant, {
    sizes,
    ageLabels,
    gender,
    material,
    secondHand,
  });

  const selectedLabel =
    selectedVariant?.sizeLabel?.trim() || selectedVariant?.ageLabel?.trim();

  return (
    <aside
      id="size-guide"
      className={cn(
        "border-tilouki-pistache/25 bg-tilouki-milk scroll-mt-24 rounded-[var(--radius-card)] border p-3",
        className,
      )}
      aria-labelledby="compact-size-guide-title"
    >
      <p
        id="compact-size-guide-title"
        className="inline-flex items-center gap-2 text-sm font-semibold"
      >
        <Ruler className="text-tilouki-pistache size-4 shrink-0" aria-hidden />
        {selectedLabel ? `Conseil pour la taille ${selectedLabel}` : "Conseil taille"}
      </p>
      <p className="text-foreground mt-1.5 text-sm leading-relaxed">{advice}</p>
      <Link
        href="/guide-tailles"
        className="text-tilouki-pistache mt-2 inline-flex text-xs font-semibold hover:underline"
      >
        Atelier des tailles →
      </Link>
    </aside>
  );
}
