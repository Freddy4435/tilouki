"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CatalogueFacetValue } from "@/types/catalog";

interface CatalogueFacetSectionProps {
  title: string;
  paramKey: string;
  values: CatalogueFacetValue[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
  className?: string;
}

export function CatalogueFacetSection({
  title,
  paramKey,
  values,
  selectedValues,
  onToggle,
  defaultOpen = true,
  className,
}: CatalogueFacetSectionProps) {
  if (values.length < 2) return null;

  return (
    <details
      open={defaultOpen}
      className={cn("group border-border/70 border-b pb-4 last:border-b-0", className)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="text-muted-foreground text-xs font-medium group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ul className="mt-2 space-y-1.5" aria-label={title}>
        {values.map((facet) => {
          const inputId = `${paramKey}-${facet.value}`.replace(/\s+/g, "-");
          const checked = selectedValues.includes(facet.value);

          return (
            <li key={facet.value}>
              <label
                htmlFor={inputId}
                className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm"
              >
                <Checkbox
                  id={inputId}
                  checked={checked}
                  onCheckedChange={() => onToggle(facet.value)}
                />
                <span className="flex-1">{facet.value}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  ({facet.count})
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
