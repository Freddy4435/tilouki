"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { PRODUCT_SORT_OPTIONS } from "@/lib/catalog/constants";
import type { Category } from "@/types/catalog";

const GENDER_LABELS: Record<string, string> = {
  fille: "Fille",
  garcon: "Garçon",
  mixte: "Mixte",
};

interface CatalogueActiveFiltersProps {
  categories: Category[];
}

export function CatalogueActiveFilters({ categories }: CatalogueActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pills: { key: string; label: string }[] = [];

  const q = searchParams.get("q");
  if (q?.trim()) pills.push({ key: "q", label: `« ${q.trim()} »` });

  const categorySlug = searchParams.get("categorie");
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    pills.push({ key: "categorie", label: cat?.name ?? categorySlug });
  }

  const genre = searchParams.get("genre");
  if (genre) pills.push({ key: "genre", label: GENDER_LABELS[genre] ?? genre });

  const season = searchParams.get("saison");
  if (season) pills.push({ key: "saison", label: season });

  const minPrice = searchParams.get("prix_min");
  if (minPrice) pills.push({ key: "prix_min", label: `Min ${minPrice} €` });

  const maxPrice = searchParams.get("prix_max");
  if (maxPrice) pills.push({ key: "prix_max", label: `Max ${maxPrice} €` });

  if (searchParams.get("promo") === "petit-prix") {
    pills.push({ key: "promo", label: "Petits prix" });
  }

  const sort = searchParams.get("tri") ?? "newest";
  if (sort !== "newest") {
    const sortLabel = PRODUCT_SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort;
    pills.push({ key: "tri", label: sortLabel });
  }

  if (pills.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key !== "page") params.delete("page");
    const query = params.toString();
    router.push(query ? `/catalogue?${query}` : "/catalogue");
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
      {pills.map((pill) => (
        <button
          key={pill.key}
          type="button"
          onClick={() => removeFilter(pill.key)}
          className="bg-primary/10 text-primary hover:bg-primary/15 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-[var(--transition-fast)]"
        >
          {pill.label}
          <X className="size-3" aria-hidden />
          <span className="sr-only">Retirer le filtre {pill.label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push("/catalogue")}
        className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-2 hover:underline"
      >
        Tout effacer
      </button>
    </div>
  );
}
