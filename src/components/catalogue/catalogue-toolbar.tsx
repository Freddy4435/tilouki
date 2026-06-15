"use client";

import { formatCatalogueResultsSummary } from "@/lib/catalog/catalogue-labels";
import { CatalogueSortSelect } from "@/components/catalogue/catalogue-sort-select";

interface CatalogueToolbarProps {
  total: number;
  page: number;
  totalPages: number;
}

export function CatalogueToolbar({ total, page, totalPages }: CatalogueToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-foreground text-sm font-medium tabular-nums">
        {formatCatalogueResultsSummary(total, page, totalPages)}
      </p>

      <CatalogueSortSelect className="hidden sm:flex" />
    </div>
  );
}
