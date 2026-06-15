"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSortLabel, isDefaultSort } from "@/lib/catalog/catalogue-labels";
import { PRODUCT_SORT_OPTIONS } from "@/lib/catalog/constants";
import { CATALOGUE_PARAM_KEYS } from "@/lib/catalog/catalogue-search-params";
import { cn } from "@/lib/utils";

interface CatalogueSortSelectProps {
  id?: string;
  className?: string;
  triggerClassName?: string;
  showLabel?: boolean;
}

export function CatalogueSortSelect({
  id = "catalogue-sort",
  className,
  triggerClassName,
  showLabel = true,
}: CatalogueSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get(CATALOGUE_PARAM_KEYS.sort) ?? "newest";
  const sortLabel = getSortLabel(currentSort);

  const onSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (isDefaultSort(value)) {
      params.delete(CATALOGUE_PARAM_KEYS.sort);
    } else {
      params.set(CATALOGUE_PARAM_KEYS.sort, value);
    }
    params.delete(CATALOGUE_PARAM_KEYS.page);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className={cn(showLabel && "flex items-center gap-2", className)}>
      {showLabel ? (
        <label id={`${id}-label`} htmlFor={id} className="text-sm font-medium">
          Trier par
        </label>
      ) : null}
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger
          id={id}
          aria-label={showLabel ? undefined : "Trier par"}
          aria-labelledby={showLabel ? `${id}-label` : undefined}
          className={triggerClassName ?? "w-full sm:w-[11rem]"}
        >
          <SelectValue placeholder="Nouveautés">{sortLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
