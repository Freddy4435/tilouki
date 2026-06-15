"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { CatalogueSortSelect } from "@/components/catalogue/catalogue-sort-select";
import { useCatalogueNavigation } from "@/hooks/use-catalogue-navigation";
import { formatArticleCount } from "@/lib/catalog/catalogue-labels";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const { reset } = useCatalogueNavigation(basePath, lockedCategorySlug);

  const resultsLabel =
    total > 0 ? `Voir ${formatArticleCount(total)}` : "Aucun article trouvé";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="min-h-11 w-full lg:hidden">
            <SlidersHorizontal className="size-4" />
            Filtres &amp; tri
          </Button>
        }
      />
      <SheetContent
        side="bottom"
        className="flex max-h-[min(88vh,720px)] flex-col gap-0 rounded-t-[var(--radius-card)] p-0 pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="border-border/60 shrink-0 border-b px-4 py-4 text-left">
          <SheetTitle className="text-lg font-semibold">Filtres &amp; tri</SheetTitle>
          <p className="text-muted-foreground text-sm">
            Choisissez l&apos;âge, le genre ou le budget — puis validez.
          </p>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="mb-5 space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase">Tri</p>
            <CatalogueSortSelect id="catalogue-sort-mobile" showLabel={false} />
          </div>

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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
