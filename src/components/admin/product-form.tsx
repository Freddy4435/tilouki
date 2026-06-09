"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch, type UseFormRegister } from "react-hook-form";
import { z } from "zod";

import { ProductImagesManager } from "@/components/admin/product-images-manager";
import {
  ProductFormFields,
  ProductSeoFields,
} from "@/components/admin/product-form-fields";
import { ProductPreviewPanel } from "@/components/admin/product-preview-panel";
import { ProductStatusActions } from "@/components/admin/product-status-actions";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils/slug";
import {
  adminCreateProductSchema,
  adminProductCoreSchema,
  adminVariantSchema,
  type AdminProductCoreInput,
} from "@/lib/validations/admin-product";
import {
  createProductAction,
  updateProductAction,
} from "@/server/actions/admin/products";
import type { AdminProductDetail } from "@/lib/supabase/queries/admin/products";
import type { ProductGender } from "@/types/database";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: AdminProductDetail;
  categories: CategoryOption[];
}

const createFormSchema = adminProductCoreSchema.extend({
  initialVariant: z.object({
    sku: z.string().optional(),
    sizeLabel: z.string().optional(),
    ageLabel: z.string().optional(),
    color: z.string().optional(),
    priceEuros: z.string().min(1, "Prix requis."),
    compareAtEuros: z.string().optional(),
    costEuros: z.string().optional(),
    stockQuantity: z.string().min(1),
    weightGrams: z.string().optional(),
    isActive: z.boolean(),
  }),
});

type CreateFormValues = z.infer<typeof createFormSchema>;

function coreDefaults(product?: AdminProductDetail): AdminProductCoreInput {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    material: product?.material ?? "",
    season: product?.season ?? "",
    brandLabel: product?.brandLabel ?? "Sans marque",
    madeIn: product?.madeIn ?? "",
    careInstructions: product?.careInstructions ?? "",
    gender: product?.gender ?? "mixte",
    status: product?.status ?? "draft",
    categoryId: product?.categoryId ?? "",
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
  };
}

function ProductCreateForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      ...coreDefaults(),
      initialVariant: {
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
      },
    },
  });

  const watched = useWatch({ control: form.control });
  const watchedName = watched.name ?? "";
  const watchedSlug = watched.slug ?? "";

  useEffect(() => {
    if (!slugTouched && watchedName) {
      form.setValue("slug", slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, slugTouched, form]);

  const categoryName = useMemo(() => {
    const id = watched.categoryId;
    if (!id) return null;
    return categories.find((c) => c.id === id)?.name ?? null;
  }, [watched.categoryId, categories]);

  const previewVariants = useMemo(() => {
    const v = watched.initialVariant;
    if (!v?.priceEuros) return [];
    const priceCents = Math.round(Number(String(v.priceEuros).replace(",", ".")) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) return [];
    const compareAt = v.compareAtEuros
      ? Math.round(Number(String(v.compareAtEuros).replace(",", ".")) * 100)
      : null;
    const costCents = v.costEuros
      ? Math.round(Number(String(v.costEuros).replace(",", ".")) * 100)
      : null;
    return [
      {
        id: "preview-variant",
        sku: v.sku || "preview",
        sizeLabel: v.sizeLabel || null,
        ageLabel: v.ageLabel || null,
        color: v.color || null,
        priceCents,
        compareAtPriceCents: compareAt,
        costCents: Number.isFinite(costCents ?? NaN) ? costCents : null,
        stockQuantity: Number(v.stockQuantity) || 0,
        weightGrams: v.weightGrams ? Number(v.weightGrams) : null,
        isActive: v.isActive ?? true,
      },
    ];
  }, [watched.initialVariant]);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      setSubmitError(null);
      const variantParsed = adminVariantSchema.safeParse({
        sku: values.initialVariant.sku || undefined,
        sizeLabel: values.initialVariant.sizeLabel || null,
        ageLabel: values.initialVariant.ageLabel || null,
        color: values.initialVariant.color || null,
        priceCents: values.initialVariant.priceEuros,
        compareAtPriceCents: values.initialVariant.compareAtEuros || null,
        costCents: values.initialVariant.costEuros || null,
        stockQuantity: values.initialVariant.stockQuantity,
        weightGrams: values.initialVariant.weightGrams || null,
        isActive: values.initialVariant.isActive,
      });

      if (!variantParsed.success) {
        setSubmitError(variantParsed.error.issues[0]?.message ?? "Variante invalide.");
        return;
      }

      const productParsed = adminCreateProductSchema.safeParse({
        ...values,
        initialVariant: variantParsed.data,
      });

      if (!productParsed.success) {
        setSubmitError(productParsed.error.issues[0]?.message ?? "Données invalides.");
        return;
      }

      const result = await createProductAction(productParsed.data);
      if (result.error) setSubmitError(result.error);
      else if (result.id) router.push(`/admin/produits/${result.id}`);
    });
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="space-y-8">
        <ProductFormFields
          register={form.register as unknown as UseFormRegister<AdminProductCoreInput>}
          errors={form.formState.errors as never}
          categories={categories}
          onSlugManualEdit={() => setSlugTouched(true)}
        />

        <section className="space-y-4 rounded-lg border p-4">
          <h2 className="text-base font-semibold">Première variante</h2>
          <p className="text-muted-foreground text-xs">
            SKU généré automatiquement si laissé vide.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...form.register("initialVariant.sku")} placeholder="Auto" />
            </div>
            <div className="space-y-2">
              <Label>Prix (€) *</Label>
              <Input
                {...form.register("initialVariant.priceEuros")}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Taille</Label>
              <Input {...form.register("initialVariant.sizeLabel")} />
            </div>
            <div className="space-y-2">
              <Label>Âge</Label>
              <Input {...form.register("initialVariant.ageLabel")} />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <Input {...form.register("initialVariant.color")} />
            </div>
            <div className="space-y-2">
              <Label>Prix barré (€)</Label>
              <Input
                {...form.register("initialVariant.compareAtEuros")}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Coût d&apos;achat (€)</Label>
              <Input
                {...form.register("initialVariant.costEuros")}
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Stock *</Label>
              <Input
                {...form.register("initialVariant.stockQuantity")}
                type="number"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Poids (g)</Label>
              <Input
                {...form.register("initialVariant.weightGrams")}
                type="number"
                min="0"
              />
            </div>
          </div>
        </section>

        <ProductSeoFields
          register={form.register as unknown as UseFormRegister<AdminProductCoreInput>}
        />

        {submitError ? (
          <p className="text-destructive text-sm" role="alert">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Créer le produit"}
        </Button>
      </form>

      <ProductPreviewPanel
        product={null}
        values={{
          name: watchedName,
          slug: watchedSlug,
          shortDescription: watched.shortDescription,
          description: watched.description,
          material: watched.material,
          season: watched.season,
          brandLabel: watched.brandLabel,
          madeIn: watched.madeIn,
          careInstructions: watched.careInstructions,
          gender: (watched.gender as ProductGender) ?? "mixte",
          categoryName,
        }}
        images={[]}
        variants={previewVariants}
      />
    </div>
  );
}

function ProductEditForm({
  product,
  categories,
}: {
  product: AdminProductDetail;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(true);

  const form = useForm<AdminProductCoreInput>({
    resolver: zodResolver(adminProductCoreSchema),
    defaultValues: coreDefaults(product),
  });

  const watched = useWatch({ control: form.control });
  const watchedName = watched.name ?? product.name;
  const watchedSlug = watched.slug ?? product.slug;

  useEffect(() => {
    if (!slugTouched && watchedName) {
      form.setValue("slug", slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, slugTouched, form]);

  const categoryName = useMemo(() => {
    const id = watched.categoryId;
    if (!id) return product.categoryName;
    return categories.find((c) => c.id === id)?.name ?? product.categoryName;
  }, [watched.categoryId, categories, product.categoryName]);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      setSubmitError(null);
      const result = await updateProductAction({ ...values, id: product.id });
      if (result.error) setSubmitError(result.error);
      else router.refresh();
    });
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <ProductStatusActions
          productId={product.id}
          status={product.status}
          hasOrders={product.hasOrders}
        />

        <form onSubmit={onSubmit} className="space-y-8">
          <ProductFormFields
            register={form.register}
            errors={form.formState.errors}
            categories={categories}
            onSlugManualEdit={() => setSlugTouched(true)}
          />

          <ProductSeoFields
          register={form.register as unknown as UseFormRegister<AdminProductCoreInput>}
        />

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : "Enregistrer le produit"}
          </Button>
        </form>

        <section className="space-y-4 border-t pt-8">
          <h2 className="text-base font-semibold">Variantes</h2>
          <ProductVariantsManager
            productId={product.id}
            productSlug={watchedSlug}
            variants={product.variants}
          />
        </section>

        <section className="space-y-4 border-t pt-8">
          <h2 className="text-base font-semibold">Images</h2>
          <ProductImagesManager
            productId={product.id}
            productName={watchedName}
            images={product.images}
          />
        </section>
      </div>

      <ProductPreviewPanel
        product={product}
        values={{
          name: watchedName,
          slug: watchedSlug,
          shortDescription: watched.shortDescription,
          description: watched.description,
          material: watched.material,
          season: watched.season,
          brandLabel: watched.brandLabel,
          madeIn: watched.madeIn,
          careInstructions: watched.careInstructions,
          gender: (watched.gender as ProductGender) ?? product.gender,
          categoryName,
        }}
        images={product.images}
        variants={product.variants}
      />
    </div>
  );
}

export function ProductForm({ product, categories }: ProductFormProps) {
  if (product) {
    return <ProductEditForm product={product} categories={categories} />;
  }
  return <ProductCreateForm categories={categories} />;
}
