"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Gift,
  MapPin,
  Moon,
  Share2,
  Shirt,
  Sun,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import {
  ATELIER_AGE_BANDS,
  ATELIER_DISCLAIMER,
  ATELIER_USAGES,
  buildAtelierCatalogueHref,
  buildAtelierPageHref,
  getAtelierAgeBand,
  getAtelierUsage,
  isAtelierAgeId,
  isAtelierUsageId,
  parseAtelierSelection,
  resolveAtelierRecommendation,
  type AtelierAgeId,
  type AtelierUsageId,
} from "@/lib/size-guide/atelier";
import { cn } from "@/lib/utils";

const USAGE_ICONS = {
  nuit: Moon,
  quotidien: Sun,
  sortie: MapPin,
  cadeau: Gift,
} as const;

export interface SizeAtelierProps {
  variant?: "compact" | "full";
  catalogueHasProducts?: boolean;
  /** Synchronise âge/usage dans l'URL (page dédiée). */
  syncUrl?: boolean;
  initialAgeId?: AtelierAgeId;
  initialUsageId?: AtelierUsageId;
}

export function SizeAtelier({
  variant = "full",
  catalogueHasProducts = true,
  syncUrl = false,
  initialAgeId,
  initialUsageId,
}: SizeAtelierProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const urlSelection = useMemo(
    () =>
      parseAtelierSelection({
        age: searchParams.get("age") ?? undefined,
        usage: searchParams.get("usage") ?? undefined,
      }),
    [searchParams],
  );

  const [localAgeId, setLocalAgeId] = useState<AtelierAgeId>(initialAgeId ?? "3-12-mois");
  const [localUsageId, setLocalUsageId] = useState<AtelierUsageId>(
    initialUsageId ?? "quotidien",
  );

  const ageId = syncUrl ? urlSelection.ageId : localAgeId;
  const usageId = syncUrl ? urlSelection.usageId : localUsageId;

  const pushSelection = useCallback(
    (nextAge: AtelierAgeId, nextUsage: AtelierUsageId) => {
      if (!syncUrl) {
        setLocalAgeId(nextAge);
        setLocalUsageId(nextUsage);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("age", nextAge);
      params.set("usage", nextUsage);
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams, syncUrl, startTransition],
  );

  const recommendation = resolveAtelierRecommendation(ageId, usageId);
  const ageBand = getAtelierAgeBand(ageId);
  const usage = getAtelierUsage(usageId);
  const catalogueHref = buildAtelierCatalogueHref(ageId, usageId);
  const blogHref = `/blog/${recommendation.blogSlug}`;
  const fullPageHref = buildAtelierPageHref(ageId, usageId);
  const isCompact = variant === "compact";

  const onCopyShareLink = async () => {
    const href =
      typeof window !== "undefined"
        ? `${window.location.origin}${fullPageHref}`
        : fullPageHref;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-retail-label text-tilouki-teal-dark">
          Âge de l&apos;enfant
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tranche d'âge">
          {ATELIER_AGE_BANDS.map((band) => {
            const selected = band.id === ageId;
            return (
              <button
                key={band.id}
                type="button"
                aria-pressed={selected}
                onClick={() => pushSelection(band.id, usageId)}
                className={cn(
                  "min-h-11 rounded-[var(--radius-button)] border px-3.5 py-2 text-left text-sm font-semibold transition-colors sm:px-4",
                  selected
                    ? "border-tilouki-teal bg-tilouki-teal text-white shadow-[var(--shadow-soft)]"
                    : "border-border bg-card text-foreground hover:border-tilouki-teal/40",
                )}
              >
                <span className="block text-[11px] font-medium opacity-80 sm:text-xs">
                  {band.shortLabel}
                </span>
                <span className="tabular-nums">{band.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-retail-label text-tilouki-teal-dark">Usage</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Usage">
          {ATELIER_USAGES.map((item) => {
            const selected = item.id === usageId;
            const Icon = USAGE_ICONS[item.id];
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => pushSelection(ageId, item.id)}
                className={cn(
                  "flex min-h-11 flex-col items-start gap-1 rounded-[var(--radius-button)] border px-3 py-2.5 text-left text-sm transition-colors",
                  selected
                    ? "border-tilouki-teal bg-tilouki-jade-soft text-tilouki-teal-dark shadow-[var(--shadow-soft)]"
                    : "border-border bg-card text-foreground hover:border-tilouki-teal/40",
                )}
              >
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {item.label}
                </span>
                {!isCompact ? (
                  <span className="text-muted-foreground text-xs leading-snug">
                    {item.description}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <article
        className="bg-card space-y-4 rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] sm:p-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <p className="text-retail-label text-tilouki-teal-dark">
            {ageBand.label} · {usage.label}
          </p>
          <h3
            className={cn(
              "font-display font-semibold text-balance",
              isCompact ? "mt-1 text-lg" : "mt-1.5 text-xl",
            )}
          >
            {recommendation.headline}
          </h3>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="bg-tilouki-cloud/60 rounded-[var(--radius-button)] p-3.5">
            <dt className="text-retail-label text-tilouki-teal-dark">Conseil taille</dt>
            <dd className="mt-1.5 text-sm leading-relaxed">{recommendation.sizeAdvice}</dd>
          </div>
          <div className="bg-tilouki-cloud/60 rounded-[var(--radius-button)] p-3.5">
            <dt className="text-retail-label text-tilouki-teal-dark">Marge conseillée</dt>
            <dd className="mt-1.5 text-sm leading-relaxed">{recommendation.marginAdvice}</dd>
          </div>
        </dl>

        <div>
          <p className="text-retail-label text-tilouki-teal-dark">Matières à privilégier</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {recommendation.materials.map((material) => (
              <li
                key={material}
                className="bg-tilouki-jade-soft text-tilouki-teal-dark inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              >
                <Shirt className="size-3" aria-hidden />
                {material}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:flex-wrap">
          {catalogueHasProducts ? (
            <ButtonLink href={catalogueHref} className="min-h-11">
              Voir le vestiaire filtré
              <ArrowRight className="size-4" />
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href={blogHref} className="min-h-11">
                Lire sur le carnet
                <BookOpen className="size-4" />
              </ButtonLink>
              <ButtonLink href="/#newsletter" variant="outline" className="min-h-11">
                Être prévenu·e des arrivées
              </ButtonLink>
            </>
          )}

          {catalogueHasProducts ? (
            <ButtonLink href={blogHref} variant="outline" className="min-h-11">
              {recommendation.blogTitle}
              <ArrowRight className="size-4" />
            </ButtonLink>
          ) : null}

          {isCompact ? (
            <ButtonLink href={fullPageHref} variant="outline" className="min-h-11">
              Conseil détaillé
              <ArrowRight className="size-4" />
            </ButtonLink>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={onCopyShareLink}
            >
              {copied ? (
                <>
                  <Check className="size-4" aria-hidden />
                  Lien copié
                </>
              ) : (
                <>
                  <Share2 className="size-4" aria-hidden />
                  Partager ce conseil
                </>
              )}
            </Button>
          )}
        </div>

        {!isCompact && catalogueHasProducts ? (
          <p className="text-muted-foreground text-xs leading-relaxed">
            Le catalogue est filtré pour{" "}
            <span className="font-medium">{ageBand.label}</span> et l&apos;usage{" "}
            <span className="font-medium">{usage.label.toLowerCase()}</span>. Les tailles
            exactes sont indiquées sur chaque fiche.
          </p>
        ) : null}
      </article>

      <p className="text-muted-foreground text-xs leading-relaxed">{ATELIER_DISCLAIMER}</p>

      {!syncUrl && isAtelierAgeId(ageId) && isAtelierUsageId(usageId) ? (
        <p className="sr-only">
          <Link href={fullPageHref}>Version partageable de ce conseil</Link>
        </p>
      ) : null}
    </div>
  );
}
