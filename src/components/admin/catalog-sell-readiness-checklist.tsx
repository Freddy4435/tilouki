"use client";

import { CheckCircle2, Circle, Info } from "lucide-react";
import Link from "next/link";

import {
  getCatalogSellReadinessSummary,
  type CatalogSellReadinessInput,
} from "@/lib/admin/catalog-sell-readiness";
import { cn } from "@/lib/utils";

interface CatalogSellReadinessChecklistProps {
  input: CatalogSellReadinessInput;
  className?: string;
}

export function CatalogSellReadinessChecklist({
  input,
  className,
}: CatalogSellReadinessChecklistProps) {
  const summary = getCatalogSellReadinessSummary(input);

  return (
    <div className={cn("rounded-xl border p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Prêt à vendre — catalogue</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Désactivez les démos, importez vos vrais articles et publiez uniquement des
            fiches complètes.
          </p>
        </div>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{summary.filledRequiredCount}</span>
          <span className="text-muted-foreground">
            {" "}
            / {summary.requiredCount} obligatoires
          </span>
        </p>
      </div>

      {summary.isReadyToSell ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          Catalogue prêt pour la vente de vrais vêtements.
        </p>
      ) : (
        <p className="text-muted-foreground mt-3 flex items-start gap-2 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" />
          Finalisez les étapes ci-dessous avant d&apos;ouvrir les ventes au public.
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {summary.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            {item.filled ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            ) : (
              <Circle
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  item.required ? "text-amber-600" : "text-muted-foreground",
                )}
              />
            )}
            <span>
              {item.label}
              {item.required ? (
                <span className="text-muted-foreground"> (obligatoire)</span>
              ) : (
                <span className="text-muted-foreground"> (recommandé)</span>
              )}
              {!item.filled && item.hint ? (
                <span className="text-muted-foreground block text-xs">{item.hint}</span>
              ) : null}
              {item.href && item.hrefLabel ? (
                <Link
                  href={item.href}
                  className="text-primary mt-0.5 inline-block text-xs underline"
                >
                  {item.hrefLabel} →
                </Link>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
