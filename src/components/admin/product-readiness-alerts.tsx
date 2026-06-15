"use client";

import {
  AlertTriangle,
  Camera,
  FolderTree,
  Package,
  Scale,
  Shirt,
  Tag,
} from "lucide-react";

import {
  getProductReadinessIssues,
  mapImagesToReadiness,
  type ProductReadinessIssueId,
  type ProductReadinessVariant,
} from "@/lib/admin/product-readiness";
import { cn } from "@/lib/utils";

const ICONS: Record<ProductReadinessIssueId, typeof Camera> = {
  "demo-product": AlertTriangle,
  "no-category": FolderTree,
  "no-photos": Camera,
  "demo-main-image": Camera,
  "technical-main-image": Camera,
  "placeholder-main-image": Camera,
  "dev-marked-main-image": Camera,
  "missing-descriptive-alt": Camera,
  "recommended-more-photos": Camera,
  "no-stock": Package,
  "no-price": Tag,
  "no-size": Shirt,
  "no-weight": Scale,
  "no-sellable-variant": Package,
};

interface ProductReadinessAlertsProps {
  images?: Array<{
    url: string;
    alt?: string | null;
    sortOrder?: number;
  }>;
  /** @deprecated Préférer images */
  imagesCount?: number;
  variants: ProductReadinessVariant[];
  categoryId?: string | null;
  slug?: string;
  className?: string;
}

export function ProductReadinessAlerts({
  images,
  imagesCount,
  variants,
  categoryId,
  slug,
  className,
}: ProductReadinessAlertsProps) {
  const issues = getProductReadinessIssues({
    images: images ? mapImagesToReadiness(images) : undefined,
    imagesCount,
    variants,
    categoryId,
    slug,
  });
  const blockingIssues = issues.filter((issue) => issue.blocking !== false);
  const recommendedIssues = issues.filter((issue) => issue.blocking === false);

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

  if (blockingIssues.length === 0 && recommendedIssues.length > 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-100">
          Fiche publiable — complétez les recommandations ci-dessous pour une vitrine
          optimale.
        </div>
        <div className="space-y-2 rounded-xl border border-sky-500/30 bg-sky-50 px-4 py-3 dark:bg-sky-950/20">
          <p className="text-sm font-medium text-sky-950 dark:text-sky-100">
            Recommandations photos
          </p>
          <ul className="space-y-1.5">
            {recommendedIssues.map((issue) => {
              const Icon = ICONS[issue.id];
              return (
                <li
                  key={issue.id}
                  className="flex items-start gap-2 text-sm text-sky-900 dark:text-sky-50/90"
                >
                  <Icon className="mt-0.5 size-3.5 shrink-0 opacity-70" />
                  {issue.message}
                </li>
              );
            })}
          </ul>
        </div>
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
        <AlertTriangle className="size-4 shrink-0" />À compléter avant publication
      </p>
      <ul className="space-y-1.5">
        {blockingIssues.map((issue) => {
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
      {recommendedIssues.length > 0 ? (
        <ul className="space-y-1.5 border-t border-amber-500/20 pt-2">
          {recommendedIssues.map((issue) => {
            const Icon = ICONS[issue.id];
            return (
              <li
                key={issue.id}
                className="flex items-start gap-2 text-sm text-amber-800/90 dark:text-amber-100/80"
              >
                <Icon className="mt-0.5 size-3.5 shrink-0 opacity-60" />
                {issue.message}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
