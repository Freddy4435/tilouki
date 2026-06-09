"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface AdminFilterSelectProps {
  paramName: string;
  options: FilterOption[];
  placeholder?: string;
  allLabel?: string;
}

export function AdminFilterSelect({
  paramName,
  options,
  placeholder = "Filtrer",
  allLabel = "Tous",
}: AdminFilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = searchParams.get(paramName) ?? "";

  const onChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(paramName);
    else params.set(paramName, value);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <Select value={current || "all"} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
