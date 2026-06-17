"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { applyStorefrontListItemGuards } from "@/lib/catalog/product-card-data";
import { isProductStorefrontListed } from "@/lib/catalog/product-sellability";
import {
  DEFAULT_VESTIAIRE_SELECTION,
  isVestiaireLowStock,
  pickVestiaireCapsule,
  VESTIAIRE_AGE_OPTIONS,
  VESTIAIRE_BUDGET_OPTIONS,
  VESTIAIRE_MOMENTS,
  type VestiaireAgeBand,
  type VestiaireBudgetId,
  type VestiaireMomentId,
  type VestiaireSelection,
} from "@/lib/catalog/vestiaire-assistant";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface HomeVestiaireAssistantProps {
  products: ProductListItem[];
}

interface SegmentControlProps<T extends string> {
  legend: string;
  options: ReadonlyArray<{ id: T; label: string; hint?: string }>;
  value: T;
  onChange: (value: T) => void;
}

function SegmentControl<T extends string>({
  legend,
  options,
  value,
  onChange,
}: SegmentControlProps<T>) {
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="text-retail-label text-muted-foreground px-0.5">
        {legend}
      </legend>
      <div
        className="flex max-w-full [scrollbar-width:none] gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label={legend}
      >
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors",
                active
                  ? "border-tilouki-navy bg-tilouki-navy text-white shadow-[var(--shadow-soft)]"
                  : "bg-tilouki-milk text-tilouki-navy border-tilouki-border hover:bg-tilouki-pistache-soft/60",
              )}
            >
              <span>{option.label}</span>
              {option.hint ? (
                <span
                  className={cn(
                    "ml-1.5 hidden text-xs font-medium sm:inline",
                    active ? "text-white/85" : "text-muted-foreground",
                  )}
                >
                  · {option.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function CapsuleProductCard({ product }: { product: ProductListItem }) {
  const guarded = applyStorefrontListItemGuards(product);
  if (!isProductStorefrontListed(guarded)) return null;

  const sizes = guarded.sizes?.slice(0, 4) ?? [];
  const lowStock = isVestiaireLowStock(guarded.totalStock);

  return (
    <article className="tilouki-product-card bg-card w-[10.5rem] shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--tilouki-border-subtle)] shadow-[var(--shadow-soft)] sm:w-[11.5rem]">
      <Link href={`/produit/${guarded.slug}`} className="group block">
        <div className="bg-tilouki-cloud/40 relative aspect-[4/5] overflow-hidden">
          {guarded.primaryImageUrl ? (
            <Image
              src={guarded.primaryImageUrl}
              alt={guarded.primaryImageAlt ?? guarded.name}
              fill
              sizes="(max-width: 640px) 42vw, 12rem"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : null}
          {lowStock ? (
            <span className="bg-tilouki-persimmon/95 absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white">
              Stock court
            </span>
          ) : null}
        </div>
        <div className="space-y-1.5 p-2.5">
          <h3 className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">
            {guarded.name}
          </h3>
          <p className="text-tilouki-navy text-sm font-bold tabular-nums">
            {formatPrice(guarded.minPriceCents)}
          </p>
          {sizes.length > 0 ? (
            <p className="text-muted-foreground text-[11px] leading-snug">
              Tailles : {sizes.join(", ")}
              {(guarded.sizes?.length ?? 0) > sizes.length ? "…" : ""}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

function VestiaireEmptyState({
  alternatives,
}: {
  alternatives: { label: string; href: string }[];
}) {
  return (
    <div className="border-tilouki-argile/30 bg-tilouki-argile-soft/35 space-y-4 rounded-[var(--radius-card)] border px-4 py-5 sm:px-5">
      <div className="flex items-start gap-3">
        <Package className="text-tilouki-argile mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold">Arrivage en préparation</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Pas assez de pièces en stock pour cette capsule — l&apos;arrivage du
            mercredi complète le dressing. En attendant, parcourez les rayons.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {alternatives.slice(0, 4).map((alt) => (
          <ButtonLink key={alt.href} href={alt.href} variant="outline" size="sm">
            {alt.label}
          </ButtonLink>
        ))}
      </div>
    </div>
  );
}

export function HomeVestiaireAssistant({ products }: HomeVestiaireAssistantProps) {
  const [selection, setSelection] = useState<VestiaireSelection>(
    DEFAULT_VESTIAIRE_SELECTION,
  );

  const capsule = useMemo(
    () => pickVestiaireCapsule(products, selection),
    [products, selection],
  );

  const listedCapsuleProducts =
    capsule?.products
      .map(applyStorefrontListItemGuards)
      .filter(isProductStorefrontListed) ?? [];

  const hasCapsule = listedCapsuleProducts.length > 0;
  const momentLabel =
    VESTIAIRE_MOMENTS.find((item) => item.id === selection.moment)?.label ?? "";
  const ageLabel =
    VESTIAIRE_AGE_OPTIONS.find((item) => item.id === selection.age)?.label ?? "";

  return (
    <section
      id="home-vestiaire"
      className="retail-section home-maison-section maison-surface maison-surface-butter border-tilouki-border/80 scroll-mt-[calc(var(--header-height)+var(--category-nav-height))] border-b"
      aria-labelledby="home-vestiaire-assistant-title"
    >
      <div className="container-tilouki section-tilouki py-8 md:py-10">
        <header className="retail-section__header mb-6 max-w-2xl md:mb-7">
          <div className="wednesday-accent-bar" aria-hidden />
          <p className="text-wednesday-label flex items-center gap-1.5">
            <Sparkles className="size-3.5" aria-hidden />
            Dressing intelligent
          </p>
          <h2
            id="home-vestiaire-assistant-title"
            className="text-section-title retail-section__title"
          >
            Composez une capsule achetable
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Choisissez le moment, l&apos;âge et le budget — Tilouki propose une
            sélection en stock avec tailles visibles et total estimé.
          </p>
        </header>

        <div className="space-y-4">
          <SegmentControl
            legend="Moment"
            options={VESTIAIRE_MOMENTS}
            value={selection.moment}
            onChange={(moment) =>
              setSelection((prev) => ({ ...prev, moment: moment as VestiaireMomentId }))
            }
          />
          <SegmentControl
            legend="Âge"
            options={VESTIAIRE_AGE_OPTIONS}
            value={selection.age}
            onChange={(age) =>
              setSelection((prev) => ({ ...prev, age: age as VestiaireAgeBand }))
            }
          />
          <SegmentControl
            legend="Budget"
            options={VESTIAIRE_BUDGET_OPTIONS}
            value={selection.budget}
            onChange={(budget) =>
              setSelection((prev) => ({ ...prev, budget: budget as VestiaireBudgetId }))
            }
          />
        </div>

        <div className="mt-6 space-y-4">
          {hasCapsule && capsule ? (
            <>
              <p className="text-muted-foreground text-sm">
                <span className="text-foreground font-semibold">
                  {listedCapsuleProducts.length} pièce
                  {listedCapsuleProducts.length > 1 ? "s" : ""}
                </span>{" "}
                pour {momentLabel.toLowerCase()} · {ageLabel.toLowerCase()}
              </p>

              <div
                className="flex [scrollbar-width:none] gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Capsule vestiaire"
              >
                {listedCapsuleProducts.map((product) => (
                  <CapsuleProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-[var(--tilouki-border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm">
                  Total estimé{" "}
                  <span className="text-tilouki-navy text-lg font-bold tabular-nums">
                    {formatPrice(capsule.totalCents)}
                  </span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    (prix les plus bas par fiche)
                  </span>
                </p>
                <ButtonLink href={capsule.capsuleHref} className="min-h-11 shrink-0">
                  Voir la capsule
                  <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </>
          ) : (
            <VestiaireEmptyState alternatives={capsule?.alternatives ?? []} />
          )}
        </div>
      </div>
    </section>
  );
}
