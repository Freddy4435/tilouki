"use client";

import { COLOR_PRESETS, DEFAULT_WEIGHT_GRAMS } from "@/lib/admin/product-form-constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface VariantFieldValues {
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
}

interface VariantFormFieldsProps {
  values: VariantFieldValues;
  onChange: <K extends keyof VariantFieldValues>(key: K, value: VariantFieldValues[K]) => void;
  productSlug?: string;
  compact?: boolean;
  showAdvanced?: boolean;
}

export function VariantFormFields({
  values,
  onChange,
  productSlug,
  compact = false,
  showAdvanced = false,
}: VariantFormFieldsProps) {
  return (
    <div className={cn("grid gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Prix de vente (€) *</Label>
        <Input
          value={values.priceEuros}
          onChange={(e) => onChange("priceEuros", e.target.value)}
          type="number"
          step="0.01"
          min="0"
          placeholder="19.90"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Stock *</Label>
        <Input
          value={values.stockQuantity}
          onChange={(e) => onChange("stockQuantity", e.target.value)}
          type="number"
          min="0"
          placeholder="5"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Taille</Label>
        <Input
          value={values.sizeLabel}
          onChange={(e) => onChange("sizeLabel", e.target.value)}
          placeholder="4A, S, 86 cm…"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Âge</Label>
        <Input
          value={values.ageLabel}
          onChange={(e) => onChange("ageLabel", e.target.value)}
          placeholder="4 ans, 6-12 mois…"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Couleur</Label>
        <Input
          value={values.color}
          onChange={(e) => onChange("color", e.target.value)}
          placeholder="Rose, imprimé licorne…"
          list="color-presets"
        />
        <datalist id="color-presets">
          {COLOR_PRESETS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="space-y-1.5">
        <Label>Poids (g)</Label>
        <Input
          value={values.weightGrams}
          onChange={(e) => onChange("weightGrams", e.target.value)}
          type="number"
          min="1"
          placeholder={DEFAULT_WEIGHT_GRAMS}
        />
        <p className="text-muted-foreground text-xs">Pour les frais de livraison (ex. tee-shirt ≈ 120 g)</p>
      </div>

      {showAdvanced ? (
        <>
          <div className="space-y-1.5">
            <Label>SKU</Label>
            <Input
              value={values.sku}
              onChange={(e) => onChange("sku", e.target.value)}
              placeholder="Généré automatiquement"
            />
            {productSlug ? (
              <p className="text-muted-foreground text-xs">Basé sur « {productSlug} » + taille/âge/couleur</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Prix barré (€)</Label>
            <Input
              value={values.compareAtEuros}
              onChange={(e) => onChange("compareAtEuros", e.target.value)}
              type="number"
              step="0.01"
              min="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Coût d&apos;achat (€)</Label>
            <Input
              value={values.costEuros}
              onChange={(e) => onChange("costEuros", e.target.value)}
              type="number"
              step="0.01"
              min="0"
            />
          </div>
        </>
      ) : null}

      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          id="variant-active-field"
          checked={values.isActive}
          onChange={(e) => onChange("isActive", e.target.checked)}
          className="size-4 rounded border"
        />
        <Label htmlFor="variant-active-field" className="font-normal">
          Variante visible en boutique
        </Label>
      </div>
    </div>
  );
}
