"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  getContextualQuickChips,
  isCatalogueQuickChipActive,
} from "@/lib/catalog/catalogue-quick-chips";
import { cn } from "@/lib/utils";

interface CatalogueQuickChipsProps {
  categorySlug?: string;
  className?: string;
}

export function CatalogueQuickChips({
  categorySlug,
  className,
}: CatalogueQuickChipsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chips = getContextualQuickChips(categorySlug);

  return (
    <nav aria-label="Raccourcis catalogue" className={cn("min-w-0", className)}>
      <ul className="flex max-w-full [scrollbar-width:none] gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => {
          const active = isCatalogueQuickChipActive(chip, pathname, searchParams);
          return (
            <li key={chip.id} className="shrink-0">
              <Link
                href={chip.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-tilouki-teal-dark bg-tilouki-teal-dark text-white shadow-[var(--shadow-soft)]"
                    : "bg-card text-tilouki-navy border-tilouki-jade/25 hover:bg-tilouki-jade-soft/50",
                )}
              >
                {chip.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
