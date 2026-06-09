"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_SORT_OPTIONS } from "@/lib/catalog/constants";

interface CatalogueToolbarProps {
  total: number;
  page: number;
  totalPages: number;
}

export function CatalogueToolbar({ total, page, totalPages }: CatalogueToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("tri") ?? "newest";

  const onSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") params.delete("tri");
    else params.set("tri", value);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        {total > 0 ? (
          <>
            {total} produit{total > 1 ? "s" : ""}
            {totalPages > 1 ? ` — page ${page} sur ${totalPages}` : ""}
          </>
        ) : (
          "Aucun produit trouvé"
        )}
      </p>

      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm font-medium">
          Trier par
        </label>
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger id="sort" className="w-[11rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
