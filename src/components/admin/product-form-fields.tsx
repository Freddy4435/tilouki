"use client";

import { ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CARE_PLACEHOLDER,
  DESCRIPTION_PLACEHOLDER,
  MADE_IN_PLACEHOLDER,
  MATERIAL_PLACEHOLDER,
  PRODUCT_NAME_EXAMPLE,
  PRODUCT_NAME_PLACEHOLDER,
  SHORT_DESC_PLACEHOLDER,
} from "@/lib/admin/product-form-constants";
import { PRODUCT_STATUS_LABELS } from "@/lib/admin/status-labels";
import type { AdminProductCoreInput } from "@/lib/validations/admin-product";
import type { ProductGender, ProductStatus } from "@/types/database";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS: { value: ProductGender; label: string }[] = [
  { value: "fille", label: "Fille" },
  { value: "garcon", label: "Garçon" },
  { value: "mixte", label: "Mixte" },
];

const SEASON_SUGGESTIONS = ["printemps-été", "automne-hiver", "toute-saison"];

const selectClass =
  "border-input bg-background flex h-8 w-full rounded-lg border px-2.5 text-sm";

interface CategoryOption {
  id: string;
  name: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  );
}

interface ProductFormFieldsProps {
  register: UseFormRegister<AdminProductCoreInput>;
  errors: FieldErrors<AdminProductCoreInput>;
  categories: CategoryOption[];
  onSlugManualEdit?: () => void;
  hideStatus?: boolean;
}

export function ProductFormFields({
  register,
  errors,
  categories,
  onSlugManualEdit,
  hideStatus = false,
}: ProductFormFieldsProps) {
  const slugRegister = register("slug");

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="flex items-start gap-2 text-sm">
          <Lightbulb className="text-primary mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-medium">Astuce Tilouki — </span>
            {PRODUCT_NAME_EXAMPLE}
          </span>
        </p>
      </div>

      <h2 className="text-base font-semibold">Fiche produit</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom du vêtement *</Label>
          <Input
            id="name"
            placeholder={PRODUCT_NAME_PLACEHOLDER}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Catégorie</Label>
          <select id="categoryId" {...register("categoryId")} className={selectClass}>
            <option value="">— Choisir —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categoryId?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Genre</Label>
          <select id="gender" {...register("gender")} className={selectClass}>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shortDescription">Description courte</Label>
          <Input
            id="shortDescription"
            placeholder={SHORT_DESC_PLACEHOLDER}
            {...register("shortDescription")}
          />
          <p className="text-muted-foreground text-xs">Visible sur les listes et en aperçu boutique.</p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description détaillée</Label>
          <textarea
            id="description"
            rows={5}
            placeholder={DESCRIPTION_PLACEHOLDER}
            {...register("description")}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
      </div>

      <h3 className="text-sm font-semibold">Caractéristiques</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="material">Matière</Label>
          <Input id="material" placeholder={MATERIAL_PLACEHOLDER} {...register("material")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="season">Saison</Label>
          <Input id="season" list="season-suggestions" placeholder="toute-saison" {...register("season")} />
          <datalist id="season-suggestions">
            {SEASON_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandLabel">Marque affichée</Label>
          <Input id="brandLabel" placeholder="Sans marque" {...register("brandLabel")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="madeIn">Fabriqué en</Label>
          <Input id="madeIn" placeholder={MADE_IN_PLACEHOLDER} {...register("madeIn")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="careInstructions">Entretien</Label>
          <textarea
            id="careInstructions"
            rows={2}
            placeholder={CARE_PLACEHOLDER}
            {...register("careInstructions")}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
      </div>

      <details className="group rounded-lg border px-3 py-2">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
          Référence technique (slug, statut)
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid gap-4 pb-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug URL</Label>
            <Input
              id="slug"
              {...slugRegister}
              onChange={(e) => {
                onSlugManualEdit?.();
                slugRegister.onChange(e);
              }}
            />
            <FieldError message={errors.slug?.message} />
          </div>
          {!hideStatus ? (
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select id="status" {...register("status")} className={selectClass}>
                {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PRODUCT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </details>
    </section>
  );
}

export function ProductSeoFields({
  register,
}: {
  register: UseFormRegister<AdminProductCoreInput>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium"
      >
        SEO (optionnel)
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="space-y-4 rounded-lg border px-3 py-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">Titre SEO</Label>
            <Input id="seoTitle" {...register("seoTitle")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription">Description SEO</Label>
            <textarea
              id="seoDescription"
              rows={3}
              {...register("seoDescription")}
              className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
