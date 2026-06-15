"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
  onChange,
  ...props
}: CheckboxProps) {
  return (
    <span className="relative inline-flex size-4 shrink-0">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer border-input checked:border-primary checked:bg-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 size-4 shrink-0 appearance-none rounded-[4px] border shadow-xs transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        checked={checked}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
        {...props}
      />
      <CheckIcon className="text-primary-foreground pointer-events-none absolute top-0.5 left-0.5 size-3 opacity-0 peer-checked:opacity-100" />
    </span>
  );
}

export { Checkbox };
