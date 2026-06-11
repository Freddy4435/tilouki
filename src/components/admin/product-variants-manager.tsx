"use client";

import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { VariantBulkAdd } from "@/components/admin/variant-bulk-add";
import {
  VariantFormFields,
  type VariantFieldValues,
} from "@/components/admin/variant-form-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { adminVariantSchema } from "@/lib/validations/admin-product";
import type { z } from "zod";
import {
  deleteVariantAction,
  saveVariantAction,
} from "@/server/actions/admin/products";
import type { AdminProductDetail } from "@/lib/supabase/queries/admin/products";
import { cn } from "@/lib/utils";

interface ProductVariantsManagerProps {
  productId: string;
  productSlug: string;
  variants: AdminProductDetail["variants"];
}

type VariantFormValues = VariantFieldValues & { id?: string };

const emptyForm = (): VariantFormValues => ({
  sku: "",
  sizeLabel: "",
  ageLabel: "",
  color: "",
  priceEuros: "",
  compareAtEuros: "",
  costEuros: "",
  stockQuantity: "1",
  weightGrams: "",
  isActive: true,
});

function toFormValues(variant: AdminProductDetail["variants"][number]): VariantFormValues {
  return {
    id: variant.id,
    sku: variant.sku,
    sizeLabel: variant.sizeLabel ?? "",
    ageLabel: variant.ageLabel ?? "",
    color: variant.color ?? "",
    priceEuros: (variant.priceCents / 100).toFixed(2),
    compareAtEuros: variant.compareAtPriceCents
      ? (variant.compareAtPriceCents / 100).toFixed(2)
      : "",
    costEuros: variant.costCents ? (variant.costCents / 100).toFixed(2) : "",
    stockQuantity: String(variant.stockQuantity),
    weightGrams: variant.weightGrams ? String(variant.weightGrams) : "",
    isActive: variant.isActive,
  };
}

type VariantSchemaInput = z.input<typeof adminVariantSchema>;

function toVariantInput(values: VariantFormValues): VariantSchemaInput {
  return {
    id: values.id,
    sku: values.sku.trim() || undefined,
    sizeLabel: values.sizeLabel || null,
    ageLabel: values.ageLabel || null,
    color: values.color || null,
    priceCents: values.priceEuros,
    compareAtPriceCents: values.compareAtEuros || undefined,
    costCents: values.costEuros || undefined,
    stockQuantity: values.stockQuantity,
    weightGrams: values.weightGrams || undefined,
    isActive: values.isActive,
  };
}

function variantTitle(variant: AdminProductDetail["variants"][number]): string {
  return (
    [variant.sizeLabel, variant.ageLabel, variant.color].filter(Boolean).join(" · ") ||
    "Sans libellé"
  );
}

export function ProductVariantsManager({
  productId,
  productSlug,
  variants,
}: ProductVariantsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<VariantFormValues | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(emptyForm());
    setShowAdvanced(false);
    setFormError(null);
  };

  const openEdit = (variant: AdminProductDetail["variants"][number]) => {
    setEditing(toFormValues(variant));
    setShowAdvanced(true);
    setFormError(null);
  };

  const closeForm = () => {
    setEditing(null);
    setFormError(null);
  };

  const updateField = <K extends keyof VariantFormValues>(
    key: K,
    value: VariantFormValues[K],
  ) => {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    const parsed = adminVariantSchema.safeParse(toVariantInput(editing));
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Variante invalide.");
      return;
    }

    startTransition(async () => {
      const result = await saveVariantAction(productId, parsed.data);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      closeForm();
      router.refresh();
    });
  };

  const toggleActive = (variant: AdminProductDetail["variants"][number]) => {
    startTransition(async () => {
      const result = await saveVariantAction(productId, {
        ...toVariantInput(toFormValues(variant)),
        isActive: !variant.isActive,
      });
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const removeVariant = (variantId: string) => {
    if (!confirm("Supprimer cette variante ?")) return;
    startTransition(async () => {
      const result = await deleteVariantAction(productId, variantId);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <VariantBulkAdd
        productId={productId}
        productSlug={productSlug}
        existingCount={variants.length}
      />

      <div className="flex justify-end">
        <Button type="button" size="sm" variant="outline" onClick={openCreate}>
          <Plus className="size-4" />
          Une variante
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
          Aucune variante — ajoutez des tailles ou âges ci-dessus.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {variants.map((variant) => (
            <article
              key={variant.id}
              className={cn(
                "rounded-xl border p-4",
                !variant.isActive && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium">
                    <GripVertical className="text-muted-foreground size-4 shrink-0" />
                    {variantTitle(variant)}
                  </p>
                  <p className="text-muted-foreground mt-0.5 font-mono text-xs">{variant.sku}</p>
                </div>
                <button type="button" onClick={() => toggleActive(variant)} disabled={isPending}>
                  <Badge variant={variant.isActive ? "default" : "secondary"}>
                    {variant.isActive ? "En ligne" : "Masquée"}
                  </Badge>
                </button>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Prix</dt>
                  <dd className="tabular-nums font-medium">{formatPrice(variant.priceCents)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Stock</dt>
                  <dd
                    className={cn(
                      "tabular-nums font-medium",
                      variant.stockQuantity === 0 && "text-amber-600",
                    )}
                  >
                    {variant.stockQuantity}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Poids</dt>
                  <dd
                    className={cn(
                      "tabular-nums font-medium",
                      !variant.weightGrams && "text-amber-600",
                    )}
                  >
                    {variant.weightGrams ? `${variant.weightGrams} g` : "—"}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex justify-end gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(variant)}
                  aria-label="Modifier"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeVariant(variant.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing ? (
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <p className="text-sm font-medium">
            {editing.id ? "Modifier la variante" : "Nouvelle variante"}
          </p>
          <VariantFormFields
            values={editing}
            onChange={updateField}
            productSlug={productSlug}
            showAdvanced={showAdvanced}
          />
          {!showAdvanced ? (
            <button
              type="button"
              className="text-primary text-xs underline"
              onClick={() => setShowAdvanced(true)}
            >
              SKU, prix barré, coût d&apos;achat…
            </button>
          ) : null}
          {formError ? (
            <p className="text-destructive text-sm" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="ghost" onClick={closeForm}>
              Annuler
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
