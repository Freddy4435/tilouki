"use client";

import { AlertTriangle, Camera, CheckCircle2, Circle, Info, Store } from "lucide-react";

import {
  buildProductPhotoChecklist,
  classifyProductImage,
  findLegacyDemoProductImageIssues,
  getMissingExpectedPhotoSlots,
  getPhotoReadinessSummary,
  getProductImageKindLabel,
  getStorefrontListingBlockersFromImages,
  getStorefrontPhotoStatus,
  STOREFRONT_PHOTO_STATUS_LABELS,
  type ProductReadinessImage,
} from "@/lib/admin/product-image-readiness";
import { cn } from "@/lib/utils";

const TIER_LABELS = {
  required: "obligatoire",
  recommended: "recommandé",
  optional: "si applicable",
} as const;

const STOREFRONT_STATUS_LABELS = {
  hidden: {
    label: STOREFRONT_PHOTO_STATUS_LABELS.hidden,
    className:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100",
    icon: AlertTriangle,
  },
  listed: {
    label: STOREFRONT_PHOTO_STATUS_LABELS.listed,
    className:
      "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100",
    icon: Store,
  },
  "ready-to-sell": {
    label: STOREFRONT_PHOTO_STATUS_LABELS["ready-to-sell"],
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100",
    icon: CheckCircle2,
  },
} as const;

interface ProductPhotoReadinessChecklistProps {
  images: ProductReadinessImage[];
  slug?: string;
  secondHand?: boolean;
  className?: string;
}

export function ProductPhotoReadinessChecklist({
  images,
  slug = "",
  secondHand = false,
  className,
}: ProductPhotoReadinessChecklistProps) {
  const items = buildProductPhotoChecklist(images, { secondHand });
  const missingSlots = getMissingExpectedPhotoSlots(images, { secondHand });
  const legacyDemoIssues = findLegacyDemoProductImageIssues(images);
  const summary = getPhotoReadinessSummary(images);
  const photoStatus = getStorefrontPhotoStatus(images);
  const blockers = slug.trim()
    ? getStorefrontListingBlockersFromImages(slug, images)
    : [];
  const statusMeta = STOREFRONT_STATUS_LABELS[photoStatus.status];
  const StatusIcon = statusMeta.icon;
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
            Objectif : 3 photos produit réelles — face, détail matière, vue portée ou
            cintre. Minimum 1 photo avec description pour le catalogue. Les visuels du
            pack Tilouki, SVG catalogue, placeholders et « Photo à venir » ne sont pas
            vendables.
          </p>
        </div>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{summary.commercialCount}</span>
          <span className="text-muted-foreground"> / {summary.targetCount} photos</span>
        </p>
      </div>

      <div
        className={cn(
          "mt-4 flex flex-wrap items-start gap-2 rounded-lg border px-3 py-2.5",
          statusMeta.className,
        )}
      >
        <StatusIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium">{statusMeta.label}</p>
          {photoStatus.status === "hidden" && blockers.length > 0 ? (
            <ul className="space-y-1 text-xs leading-relaxed">
              {blockers.map((blocker) => (
                <li key={blocker.id}>{blocker.message}</li>
              ))}
            </ul>
          ) : photoStatus.status === "listed" ? (
            <p className="text-xs leading-relaxed">
              Le produit apparaît dans le catalogue et sur l&apos;accueil. Ajoutez{" "}
              {photoStatus.targetCount - photoStatus.commercialCount} photo(s) pour
              atteindre l&apos;état « Prêt à vendre ».
            </p>
          ) : photoStatus.status === "ready-to-sell" ? (
            <p className="text-xs leading-relaxed">
              {photoStatus.commercialCount} photos commerciales — fiche complète pour
              rassurer les parents avant achat.
            </p>
          ) : null}
        </div>
      </div>

      {legacyDemoIssues.length > 0 ? (
        <div
          className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
          role="alert"
        >
          <p className="font-medium">Visuels démo encore présents</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs leading-relaxed">
            {legacyDemoIssues.map((issue) => (
              <li key={issue.url}>
                <code className="text-[11px]">{issue.pathname}</code> — {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {missingSlots.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Photos manquantes attendues</p>
          <ul className="space-y-2">
            {missingSlots.map((slot) => (
              <li
                key={slot.id}
                className="rounded-lg border border-dashed px-3 py-2.5 text-sm"
              >
                <p className="font-medium">{slot.label}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {slot.hint}
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Ex. fichier :{" "}
                  <code className="text-foreground">{slot.exampleFilename}</code>
                  <br />
                  Ex. description : « {slot.exampleAlt} »
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pendingRequired.length > 0 ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" />
          Ajoutez une photo face avant réelle avec une description détaillée avant
          publication.
        </p>
      ) : summary.readyToSell ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          Tous les critères obligatoires sont remplis — fiche prête à vendre.
        </p>
      ) : photoStatus.status === "listed" ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" />
          Photo principale OK. Complétez avec une 2ᵉ photo (détail matière) et une 3ᵉ
          (vue portée, cintre ou pliage) pour une fiche complète.
        </p>
      ) : null}

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
                    {getProductImageKindLabel(kind, image.url)}
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
