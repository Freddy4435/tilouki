"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/catalog";

interface CatalogueFiltersProps {
  categories: Category[];
}

export function CatalogueFilters({ categories }: CatalogueFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    });
    params.delete("page");
    router.push(`/catalogue?${params.toString()}`);
  };

  const reset = () => router.push("/catalogue");

  return (
    <aside className="bg-card space-y-4 rounded-2xl border p-4 shadow-[var(--shadow-soft)] lg:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtres</h2>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Réinitialiser
        </Button>
      </div>

      <div className="space-y-2">
        <label htmlFor="filter-q" className="text-xs font-medium">
          Recherche
        </label>
        <Input
          id="filter-q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Nom, matière…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ q: e.currentTarget.value || null });
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Catégorie</label>
        <Select
          value={searchParams.get("categorie") ?? "all"}
          onValueChange={(value) =>
            updateParams({ categorie: !value || value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Genre</label>
        <Select
          value={searchParams.get("genre") ?? "all"}
          onValueChange={(value) =>
            updateParams({ genre: !value || value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="fille">Fille</SelectItem>
            <SelectItem value="garcon">Garçon</SelectItem>
            <SelectItem value="mixte">Mixte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="prix-min" className="text-xs font-medium">
            Prix min (€)
          </label>
          <Input
            id="prix-min"
            type="number"
            min={0}
            step={1}
            defaultValue={searchParams.get("prix_min") ?? ""}
            onBlur={(e) => updateParams({ prix_min: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="prix-max" className="text-xs font-medium">
            Prix max (€)
          </label>
          <Input
            id="prix-max"
            type="number"
            min={0}
            step={1}
            defaultValue={searchParams.get("prix_max") ?? ""}
            onBlur={(e) => updateParams({ prix_max: e.target.value || null })}
          />
        </div>
      </div>
    </aside>
  );
}
