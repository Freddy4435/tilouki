"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { adminVariantSchema } from "@/lib/validations/admin-product";
import type { z } from "zod";
import {
  deleteVariantAction,
  saveVariantAction,
} from "@/server/actions/admin/products";
import type { AdminProductDetail } from "@/lib/supabase/queries/admin/products";

interface ProductVariantsManagerProps {
  productId: string;
  productSlug: string;
  variants: AdminProductDetail["variants"];
}

type VariantFormValues = {
  id?: string;
  sku: string;
  sizeLabel: string;
  ageLabel: string;
  color: string;
  priceEuros: string;
  compareAtEuros: string;
  costEuros: string;
  stockQuantity: string;
  weightGrams: string;
  isActive: boolean;
};

const emptyForm = (): VariantFormValues => ({
  sku: "",
  sizeLabel: "",
  ageLabel: "",
  color: "",
  priceEuros: "",
  compareAtEuros: "",
  costEuros: "",
  stockQuantity: "0",
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

export function ProductVariantsManager({
  productId,
  productSlug,
  variants,
}: ProductVariantsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<VariantFormValues | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(emptyForm());
    setFormError(null);
  };

  const openEdit = (variant: AdminProductDetail["variants"][number]) => {
    setEditing(toFormValues(variant));
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
      <div className="flex justify-end">
        <Button type="button" size="sm" variant="outline" onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter une variante
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Taille / Âge / Couleur</th>
              <th className="p-3 text-right font-medium">Prix</th>
              <th className="p-3 text-right font-medium">Stock</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground p-6 text-center">
                  Aucune variante.
                </td>
              </tr>
            ) : (
              variants.map((variant) => (
                <tr key={variant.id} className="border-b last:border-0">
                  <td className="p-3 font-mono text-xs">{variant.sku}</td>
                  <td className="p-3">
                    {[variant.sizeLabel, variant.ageLabel, variant.color]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {formatPrice(variant.priceCents)}
                    {variant.compareAtPriceCents ? (
                      <span className="text-muted-foreground ml-1 text-xs line-through">
                        {formatPrice(variant.compareAtPriceCents)}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3 text-right tabular-nums">{variant.stockQuantity}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(variant)}
                      disabled={isPending}
                    >
                      <Badge variant={variant.isActive ? "default" : "secondary"}>
                        {variant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-muted/20 p-4">
          <p className="text-sm font-medium">
            {editing.id ? "Modifier la variante" : "Nouvelle variante"}
          </p>
          <p className="text-muted-foreground text-xs">
            SKU auto : laissez vide pour générer depuis « {productSlug} »
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input
                value={editing.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="Auto"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prix (€) *</Label>
              <Input
                value={editing.priceEuros}
                onChange={(e) => updateField("priceEuros", e.target.value)}
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Taille</Label>
              <Input
                value={editing.sizeLabel}
                onChange={(e) => updateField("sizeLabel", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Âge</Label>
              <Input
                value={editing.ageLabel}
                onChange={(e) => updateField("ageLabel", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Couleur</Label>
              <Input
                value={editing.color}
                onChange={(e) => updateField("color", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prix barré (€)</Label>
              <Input
                value={editing.compareAtEuros}
                onChange={(e) => updateField("compareAtEuros", e.target.value)}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Coût d&apos;achat (€)</Label>
              <Input
                value={editing.costEuros}
                onChange={(e) => updateField("costEuros", e.target.value)}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stock *</Label>
              <Input
                value={editing.stockQuantity}
                onChange={(e) => updateField("stockQuantity", e.target.value)}
                type="number"
                min="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Poids (g)</Label>
              <Input
                value={editing.weightGrams}
                onChange={(e) => updateField("weightGrams", e.target.value)}
                type="number"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="variant-active"
                checked={editing.isActive}
                onChange={(e) => updateField("isActive", e.target.checked)}
              />
              <Label htmlFor="variant-active">Variante active</Label>
            </div>
          </div>
          {formError ? (
            <p className="text-destructive text-sm" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer la variante"}
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
