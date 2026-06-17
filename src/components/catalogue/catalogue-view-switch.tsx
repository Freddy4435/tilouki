"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  buildCatalogueViewSearchParams,
  buildPathWithSearchParams,
  CATALOGUE_VIEW_LABELS,
  CATALOGUE_VIEWS,
  parseCatalogueView,
  type CatalogueView,
} from "@/lib/catalog/catalogue-view";
import { cn } from "@/lib/utils";

interface CatalogueViewSwitchProps {
  basePath?: string;
  className?: string;
}

export function CatalogueViewSwitch({
  basePath = "/catalogue",
  className,
}: CatalogueViewSwitchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = parseCatalogueView(Object.fromEntries(searchParams.entries()));

  const setView = (view: CatalogueView) => {
    const params = buildCatalogueViewSearchParams(
      new URLSearchParams(searchParams.toString()),
      view,
    );
    router.push(buildPathWithSearchParams(basePath, params));
  };

  return (
    <div
      role="tablist"
      aria-label="Mode d'affichage du catalogue"
      className={cn(
        "bg-tilouki-cloud/60 border-tilouki-border-subtle inline-flex max-w-full gap-1 rounded-full border p-1",
        className,
      )}
    >
      {CATALOGUE_VIEWS.map((view) => {
        const active = currentView === view;
        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setView(view)}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors",
              active
                ? "bg-tilouki-navy text-white shadow-[var(--shadow-soft)]"
                : "text-tilouki-navy hover:bg-tilouki-milk/80",
            )}
          >
            {CATALOGUE_VIEW_LABELS[view]}
          </button>
        );
      })}
    </div>
  );
}
