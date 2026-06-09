"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRODUCT_STATUS_LABELS } from "@/lib/admin/status-labels";
import type { AdminProductCoreInput } from "@/lib/validations/admin-product";
import type { ProductGender, ProductStatus } from "@/types/database";

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
}

export function ProductFormFields({
  register,
  errors,
  categories,
  onSlugManualEdit,
}: ProductFormFieldsProps) {
  const slugRegister = register("slug");
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Informations générales</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
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
        <div className="space-y-2">
          <Label htmlFor="categoryId">Catégorie</Label>
          <select id="categoryId" {...register("categoryId")} className={selectClass}>
            <option value="">— Aucune —</option>
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
        <div className="space-y-2">
          <Label htmlFor="brandLabel">Marque affichée</Label>
          <Input id="brandLabel" {...register("brandLabel")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shortDescription">Description courte</Label>
          <Input id="shortDescription" {...register("shortDescription")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={6}
            {...register("description")}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="material">Matière</Label>
          <Input id="material" {...register("material")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="season">Saison</Label>
          <Input id="season" list="season-suggestions" {...register("season")} />
          <datalist id="season-suggestions">
            {SEASON_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="madeIn">Origine fabrication</Label>
          <Input id="madeIn" {...register("madeIn")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="careInstructions">Guide entretien</Label>
          <textarea
            id="careInstructions"
            rows={3}
            {...register("careInstructions")}
            className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
      </div>
    </section>
  );
}

export function ProductSeoFields({
  register,
}: {
  register: UseFormRegister<AdminProductCoreInput>;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">SEO</h2>
      <div className="space-y-4">
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
    </section>
  );
}
