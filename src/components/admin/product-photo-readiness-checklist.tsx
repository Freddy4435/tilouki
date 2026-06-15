"use client";

import { Camera, CheckCircle2, Circle, Info } from "lucide-react";

import {
  buildProductPhotoChecklist,
  classifyProductImage,
  getPhotoReadinessSummary,
  getProductImageKindLabel,
  type ProductReadinessImage,
} from "@/lib/admin/product-image-readiness";
import { cn } from "@/lib/utils";

const TIER_LABELS = {
  required: "obligatoire",
  recommended: "recommandé",
  optional: "si applicable",
} as const;

interface ProductPhotoReadinessChecklistProps {
  images: ProductReadinessImage[];
  secondHand?: boolean;
  className?: string;
}

export function ProductPhotoReadinessChecklist({
  images,
  secondHand = false,
  className,
}: ProductPhotoReadinessChecklistProps) {
  const items = buildProductPhotoChecklist(images, { secondHand });
  const summary = getPhotoReadinessSummary(images);
  const pendingRequired = items.filter(
    (item) => item.tier === "required" && !item.filled,
  );
  const filledCount = items.filter((item) => item.filled).length;

  return (
    <div className={cn("rounded-xl border p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Photos prêtes à vendre</h3>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Minimum 1 photo réelle avec description pour le catalogue.{" "}
            {summary.targetCount} photos recommandées (face, matière, couleur fidèle).
            Les SVG catalogue, placeholders et « Photo à venir » sont interdits en
            vitrine.
          </p>
        </div>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{summary.commercialCount}</span>
          <span className="text-muted-foreground"> / {summary.targetCount} photos</span>
        </p>
      </div>

      {pendingRequired.length > 0 ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" />
          Ajoutez une photo face avant réelle avec une description détaillée avant
          publication.
        </p>
      ) : summary.readyToSell ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          Fiche prête à vendre — {summary.commercialCount} photos commerciales.
        </p>
      ) : (
        <p className="mt-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" />
          Photo principale OK. Ajoutez encore{" "}
          {summary.targetCount - summary.commercialCount} photo(s) (détail matière,
          couleur fidèle) pour une fiche complète.
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            {item.filled ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            ) : (
              <Circle
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  item.tier === "required" ? "text-amber-600" : "text-muted-foreground",
                )}
              />
            )}
            <span>
              {item.label}
              <span className="text-muted-foreground"> ({TIER_LABELS[item.tier]})</span>
              {!item.filled ? (
                <span className="text-muted-foreground block text-xs">{item.hint}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground mt-3 text-xs">
        Checklist : {filledCount} / {items.length} critères —{" "}
        <span className="font-medium tabular-nums">{summary.commercialCount}</span>{" "}
        photo(s) commerciale(s) détectée(s).
      </p>

      {images.length > 0 ? (
        <div className="mt-4 space-y-1.5 border-t pt-3">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Fichiers actuels
          </p>
          {images
            .slice()
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((image, index) => {
              const kind = classifyProductImage(image.url, image.alt);
              const altOk =
                kind === "commercial" &&
                Boolean(image.alt?.trim()) &&
                !/photo\s*à\s*venir/i.test(image.alt ?? "");
              return (
                <p key={`${image.url}-${index}`} className="text-xs">
                  <Camera className="mr-1 inline size-3 opacity-60" />
                  {index === 0 ? "Principale — " : ""}
                  <span
                    className={cn(
                      kind === "commercial" && altOk
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-amber-800 dark:text-amber-300",
                    )}
                  >
                    {getProductImageKindLabel(kind)}
                    {kind === "commercial" && !altOk ? " (alt manquant)" : ""}
                  </span>
                </p>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}
