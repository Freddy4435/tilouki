"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { CatalogueActiveFilters } from "@/components/catalogue/catalogue-active-filters";
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { CatalogueSortSelect } from "@/components/catalogue/catalogue-sort-select";
import { useCatalogueNavigation } from "@/hooks/use-catalogue-navigation";
import { formatArticleCount } from "@/lib/catalog/catalogue-labels";
import { countActiveCatalogueFilters } from "@/lib/catalog/catalogue-search-params";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CatalogueFacets, Category } from "@/types/catalog";

interface CatalogueFiltersMobileProps {
  categories: Category[];
  facets: CatalogueFacets;
  total: number;
  lockedCategorySlug?: string;
  basePath?: string;
}

export function CatalogueFiltersMobile({
  categories,
  facets,
  total,
  lockedCategorySlug,
  basePath = "/catalogue",
}: CatalogueFiltersMobileProps) {
  const [open, setOpen] = useState(false);
  const { searchParams, reset } = useCatalogueNavigation(basePath, lockedCategorySlug);
  const activeFilterCount = countActiveCatalogueFilters(searchParams, {
    lockedCategorySlug,
  });
  const hasActiveFilters = activeFilterCount > 0;

  const resultsLabel =
    total > 0 ? `Voir ${formatArticleCount(total)}` : "Aucun article trouvé";

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex min-w-0 items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                className="min-h-10 shrink-0 gap-2 rounded-full px-3.5 lg:hidden"
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                <span className="text-sm font-semibold">Filtres</span>
                {hasActiveFilters ? (
                  <span className="bg-primary-foreground/20 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            }
          />
          <SheetContent
            side="bottom"
            className="flex max-h-[min(88vh,720px)] flex-col gap-0 rounded-t-[var(--radius-card)] p-0 pb-[env(safe-area-inset-bottom)]"
          >
            <SheetHeader className="border-border/60 shrink-0 border-b px-4 py-4 text-left">
              <SheetTitle className="text-lg font-semibold">
                Filtres &amp; tri
              </SheetTitle>
              <p className="text-muted-foreground text-sm">
                Âge, taille, prix et genre — ajustez puis fermez pour voir la grille.
              </p>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {total > 0 ? (
                <div className="mb-5 space-y-2">
                  <p className="text-xs font-semibold tracking-wide uppercase">Tri</p>
                  <CatalogueSortSelect id="catalogue-sort-mobile" showLabel={false} />
                </div>
              ) : null}

              <CatalogueFilters
                categories={categories}
                facets={facets}
                embedded
                lockedCategorySlug={lockedCategorySlug}
                basePath={basePath}
              />
            </div>

            <SheetFooter className="border-border/60 bg-card shrink-0 gap-2 border-t p-4 sm:flex-col">
              <Button
                type="button"
                className="min-h-11 w-full"
                onClick={() => setOpen(false)}
              >
                {resultsLabel}
              </Button>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                >
                  <RotateCcw className="size-4" />
                  Effacer les filtres
                </Button>
              ) : null}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <p
          className="text-foreground min-w-0 flex-1 truncate text-sm font-medium tabular-nums"
          aria-live="polite"
        >
          {formatArticleCount(total)}
        </p>

        {total > 0 ? (
          <CatalogueSortSelect
            id="catalogue-sort-mobile-inline"
            showLabel={false}
            className="shrink-0 lg:hidden"
            triggerClassName="min-h-10 w-[8.5rem] rounded-full text-xs"
          />
        ) : null}

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground min-h-10 shrink-0 rounded-full px-2.5 text-xs font-semibold"
            onClick={reset}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">Reset</span>
          </Button>
        ) : null}
      </div>

      <CatalogueActiveFilters
        categories={categories}
        basePath={basePath}
        lockedCategorySlug={lockedCategorySlug}
        className={cn("mb-0 lg:hidden", !hasActiveFilters && "hidden")}
        compact
      />
    </div>
  );
}
