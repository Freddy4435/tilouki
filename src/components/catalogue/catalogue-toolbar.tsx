"use client";

import { formatCatalogueResultsSummary } from "@/lib/catalog/catalogue-labels";
import { CatalogueSortSelect } from "@/components/catalogue/catalogue-sort-select";

interface CatalogueToolbarProps {
  total: number;
  page: number;
  totalPages: number;
  showSort?: boolean;
}

export function CatalogueToolbar({
  total,
  page,
  totalPages,
  showSort = true,
}: CatalogueToolbarProps) {
  return (
    <div className="mb-3 hidden flex-col gap-2 sm:mb-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
      <p className="text-foreground text-sm font-medium tabular-nums">
        {formatCatalogueResultsSummary(total, page, totalPages)}
      </p>

      {showSort ? (
        <CatalogueSortSelect className="hidden sm:flex lg:hidden" triggerClassName="min-h-9" />
      ) : null}
    </div>
  );
}
