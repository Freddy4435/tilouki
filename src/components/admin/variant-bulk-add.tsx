"use client";

import { Layers, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  VariantFormFields,
  type VariantFieldValues,
} from "@/components/admin/variant-form-fields";
import {
  AGE_PRESETS,
  DEFAULT_WEIGHT_GRAMS,
  SIZE_PRESETS,
} from "@/lib/admin/product-form-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminVariantSchema } from "@/lib/validations/admin-product";
import { bulkSaveVariantsAction } from "@/server/actions/admin/products";
import { cn } from "@/lib/utils";

type BulkMode = "age" | "size";

const emptyShared = (): VariantFieldValues => ({
  sku: "",
  sizeLabel: "",
  ageLabel: "",
  color: "",
  priceEuros: "",
  compareAtEuros: "",
  costEuros: "",
  stockQuantity: "1",
  weightGrams: DEFAULT_WEIGHT_GRAMS,
  isActive: true,
});

function parseLabels(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface VariantBulkAddProps {
  productId?: string;
  productSlug: string;
  existingCount?: number;
  onCreateVariants?: (variants: VariantFieldValues[]) => void;
  className?: string;
}

export function VariantBulkAdd({
  productId,
  productSlug,
  existingCount = 0,
  onCreateVariants,
  className,
}: VariantBulkAddProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(existingCount === 0);
  const [mode, setMode] = useState<BulkMode>("age");
  const [labelsRaw, setLabelsRaw] = useState("");
  const [shared, setShared] = useState<VariantFieldValues>(emptyShared);
  const [error, setError] = useState<string | null>(null);

  const presets = mode === "age" ? AGE_PRESETS : SIZE_PRESETS;

  const previewLabels = useMemo(() => parseLabels(labelsRaw), [labelsRaw]);

  const updateShared = <K extends keyof VariantFieldValues>(
    key: K,
    value: VariantFieldValues[K],
  ) => {
    setShared((prev) => ({ ...prev, [key]: value }));
  };

  const togglePreset = (label: string) => {
    const current = parseLabels(labelsRaw);
    if (current.includes(label)) {
      setLabelsRaw(current.filter((l) => l !== label).join(", "));
    } else {
      setLabelsRaw([...current, label].join(", "));
    }
  };

  const buildVariants = (): VariantFieldValues[] => {
    return previewLabels.map((label) => ({
      ...shared,
      sizeLabel: mode === "size" ? label : shared.sizeLabel,
      ageLabel: mode === "age" ? label : shared.ageLabel,
      sku: "",
    }));
  };

  const submit = () => {
    setError(null);
    const built = buildVariants();
    if (built.length === 0) {
      setError("Sélectionnez ou saisissez au moins une taille ou un âge.");
      return;
    }

    for (const variant of built) {
      const parsed = adminVariantSchema.safeParse({
        sizeLabel: variant.sizeLabel || null,
        ageLabel: variant.ageLabel || null,
        color: variant.color || null,
        priceCents: variant.priceEuros,
        compareAtPriceCents: variant.compareAtEuros || undefined,
        costCents: variant.costEuros || undefined,
        stockQuantity: variant.stockQuantity,
        weightGrams: variant.weightGrams || undefined,
        isActive: variant.isActive,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Données invalides.");
        return;
      }
    }

    if (onCreateVariants) {
      onCreateVariants(built);
      setOpen(false);
      setLabelsRaw("");
      return;
    }

    if (!productId) return;

    startTransition(async () => {
      const payload = built.map((v) => ({
        sizeLabel: v.sizeLabel || null,
        ageLabel: v.ageLabel || null,
        color: v.color || null,
        priceCents: v.priceEuros,
        compareAtPriceCents: v.compareAtEuros || undefined,
        costCents: v.costEuros || undefined,
        stockQuantity: v.stockQuantity,
        weightGrams: v.weightGrams || undefined,
        isActive: v.isActive,
      }));

      const result = await bulkSaveVariantsAction(productId, payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setLabelsRaw("");
      router.refresh();
    });
  };

  return (
    <div className={cn("space-y-4 rounded-xl border border-dashed p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="text-primary size-4" />
          <p className="text-sm font-medium">Ajout rapide de plusieurs tailles</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Masquer" : "Afficher"}
        </Button>
      </div>

      {open ? (
        <>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Même prix, couleur et stock pour toutes les tailles/âges sélectionnés. Le
            SKU est généré automatiquement pour chaque variante.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "age" ? "default" : "outline"}
              onClick={() => setMode("age")}
            >
              Par âge
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "size" ? "default" : "outline"}
              onClick={() => setMode("size")}
            >
              Par taille
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => {
              const selected = previewLabels.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => togglePreset(preset)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/40",
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <Label>
              {mode === "age" ? "Âges" : "Tailles"} (séparés par des virgules)
            </Label>
            <Input
              value={labelsRaw}
              onChange={(e) => setLabelsRaw(e.target.value)}
              placeholder={mode === "age" ? "2 ans, 3 ans, 4 ans" : "3A, 4A, 5A"}
            />
          </div>

          <VariantFormFields
            values={shared}
            onChange={updateShared}
            productSlug={productSlug}
            compact
          />

          {previewLabels.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              {previewLabels.length} variante{previewLabels.length > 1 ? "s" : ""} à
              créer : {previewLabels.join(", ")}
            </p>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            disabled={isPending || previewLabels.length === 0}
            onClick={submit}
          >
            <Plus className="size-4" />
            {isPending
              ? "Création…"
              : `Créer ${previewLabels.length || ""} variante${previewLabels.length > 1 ? "s" : ""}`}
          </Button>
        </>
      ) : null}
    </div>
  );
}
