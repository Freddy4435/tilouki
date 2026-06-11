"use client";

import { AlertTriangle, Camera, Package, Scale } from "lucide-react";

import {
  getProductReadinessIssues,
  type ProductReadinessVariant,
} from "@/lib/admin/product-readiness";
import { cn } from "@/lib/utils";

const ICONS = {
  "no-photos": Camera,
  "no-stock": Package,
  "no-weight": Scale,
} as const;

interface ProductReadinessAlertsProps {
  imagesCount: number;
  variants: ProductReadinessVariant[];
  className?: string;
}

export function ProductReadinessAlerts({
  imagesCount,
  variants,
  className,
}: ProductReadinessAlertsProps) {
  const issues = getProductReadinessIssues({ imagesCount, variants });

  if (issues.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-100",
          className,
        )}
      >
        Fiche prête à être publiée.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 dark:bg-amber-950/20",
        className,
      )}
      role="status"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-amber-950 dark:text-amber-100">
        <AlertTriangle className="size-4 shrink-0" />
        À compléter avant publication
      </p>
      <ul className="space-y-1.5">
        {issues.map((issue) => {
          const Icon = ICONS[issue.id];
          return (
            <li
              key={issue.id}
              className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-50/90"
            >
              <Icon className="mt-0.5 size-3.5 shrink-0 opacity-70" />
              {issue.message}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
