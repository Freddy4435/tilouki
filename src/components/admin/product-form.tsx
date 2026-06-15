"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ProductImagesManager } from "@/components/admin/product-images-manager";
import {
  ProductFormFields,
  ProductSeoFields,
} from "@/components/admin/product-form-fields";
import { ProductPreviewPanel } from "@/components/admin/product-preview-panel";
import { ProductReadinessAlerts } from "@/components/admin/product-readiness-alerts";
import { ProductPhotoReadinessChecklist } from "@/components/admin/product-photo-readiness-checklist";
import { isLikelySecondHandProduct } from "@/lib/catalog/product-sellability";
import { ProductStatusActions } from "@/components/admin/product-status-actions";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import { VariantBulkAdd } from "@/components/admin/variant-bulk-add";
import type { VariantFieldValues } from "@/components/admin/variant-form-fields";
import { Button } from "@/components/ui/button";
import {
  formatPublishBlockMessage,
  getProductReadinessIssues,
  isReadyToPublish,
  mapImagesToReadiness,
} from "@/lib/admin/product-readiness";
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
import type { ProductGender, ProductStatus } from "@/types/database";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: AdminProductDetail;
  categories: CategoryOption[];
}

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

function variantFieldsToPreview(v: VariantFieldValues, index: number) {
  const priceCents = Math.round(Number(String(v.priceEuros).replace(",", ".")) * 100);
  if (!Number.isFinite(priceCents) || priceCents < 0) return null;
  const compareAt = v.compareAtEuros
    ? Math.round(Number(String(v.compareAtEuros).replace(",", ".")) * 100)
    : null;
  const costCents = v.costEuros
    ? Math.round(Number(String(v.costEuros).replace(",", ".")) * 100)
    : null;
  return {
    id: `preview-${index}`,
    sku: v.sku || `preview-${index}`,
    sizeLabel: v.sizeLabel || null,
    ageLabel: v.ageLabel || null,
    color: v.color || null,
    priceCents,
    compareAtPriceCents: compareAt,
    costCents: Number.isFinite(costCents ?? NaN) ? costCents : null,
    stockQuantity: Number(v.stockQuantity) || 0,
    weightGrams: v.weightGrams ? Number(v.weightGrams) : null,
    isActive: v.isActive ?? true,
  };
}

function variantLabel(v: VariantFieldValues): string {
  return [v.sizeLabel, v.ageLabel, v.color].filter(Boolean).join(" · ") || "Variante";
}

function ProductCreateForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pendingVariants, setPendingVariants] = useState<VariantFieldValues[]>([]);

  const form = useForm<AdminProductCoreInput>({
    resolver: zodResolver(adminProductCoreSchema),
    defaultValues: coreDefaults(),
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

  const previewVariants = useMemo(
    () =>
      pendingVariants
        .map((v, i) => variantFieldsToPreview(v, i))
        .filter((v): v is NonNullable<typeof v> => v !== null),
    [pendingVariants],
  );

  const readinessVariants = useMemo(
    () =>
      previewVariants.map((v) => ({
        stockQuantity: v.stockQuantity,
        weightGrams: v.weightGrams,
        isActive: v.isActive,
        priceCents: v.priceCents,
        sizeLabel: v.sizeLabel,
        ageLabel: v.ageLabel,
      })),
    [previewVariants],
  );

  const submitWithStatus = (targetStatus: ProductStatus) => {
    form.handleSubmit((values) => {
      if (pendingVariants.length === 0) {
        setSubmitError("Ajoutez au moins une variante (taille ou âge).");
        return;
      }

      const parsedVariants = pendingVariants.map((v) =>
        adminVariantSchema.safeParse({
          sku: v.sku || undefined,
          sizeLabel: v.sizeLabel || null,
          ageLabel: v.ageLabel || null,
          color: v.color || null,
          priceCents: v.priceEuros,
          compareAtPriceCents: v.compareAtEuros || null,
          costCents: v.costEuros || null,
          stockQuantity: v.stockQuantity,
          weightGrams: v.weightGrams || null,
          isActive: v.isActive,
        }),
      );

      const invalid = parsedVariants.find((p) => !p.success);
      if (invalid && !invalid.success) {
        setSubmitError(invalid.error.issues[0]?.message ?? "Variante invalide.");
        return;
      }

      if (targetStatus === "active") {
        const issues = getProductReadinessIssues({
          imagesCount: 0,
          variants: readinessVariants,
          categoryId: values.categoryId,
          slug: values.slug || slugify(values.name),
        });
        if (!isReadyToPublish(issues)) {
          setSubmitError(formatPublishBlockMessage(issues));
          return;
        }
      }

      startTransition(async () => {
        setSubmitError(null);
        const productParsed = adminCreateProductSchema.safeParse({
          ...values,
          status: targetStatus,
          initialVariants: parsedVariants.map((p) => p.data!),
        });

        if (!productParsed.success) {
          setSubmitError(
            productParsed.error.issues[0]?.message ?? "Données invalides.",
          );
          return;
        }

        const result = await createProductAction(productParsed.data);
        if (result.error) setSubmitError(result.error);
        else if (result.id) router.push(`/admin/produits/${result.id}`);
      });
    })();
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitWithStatus("draft");
        }}
        className="space-y-8"
      >
        <ProductFormFields
          register={form.register}
          errors={form.formState.errors}
          categories={categories}
          onSlugManualEdit={() => setSlugTouched(true)}
          hideStatus
        />

        <section className="space-y-4">
          <h2 className="text-base font-semibold">Tailles, âges & stock</h2>
          <VariantBulkAdd
            productSlug={watchedSlug || "nouveau-produit"}
            existingCount={pendingVariants.length}
            onCreateVariants={(variants) =>
              setPendingVariants((prev) => [...prev, ...variants])
            }
          />

          {pendingVariants.length > 0 ? (
            <ul className="space-y-2">
              {pendingVariants.map((v, index) => (
                <li
                  key={`${variantLabel(v)}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium">{variantLabel(v)}</span>
                    <span className="text-muted-foreground ml-2">
                      {v.priceEuros} € · stock {v.stockQuantity}
                      {v.weightGrams ? ` · ${v.weightGrams} g` : ""}
                    </span>
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Retirer"
                    onClick={() =>
                      setPendingVariants((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="text-destructive size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
              Aucune variante — utilisez l&apos;ajout rapide ci-dessus.
            </p>
          )}
        </section>

        <ProductReadinessAlerts
          imagesCount={0}
          variants={readinessVariants}
          categoryId={watched.categoryId}
          slug={watchedSlug}
        />

        <ProductSeoFields register={form.register} />

        {submitError ? (
          <p className="text-destructive text-sm" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="outline" disabled={isPending}>
            {isPending ? "Enregistrement…" : "Enregistrer en brouillon"}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => submitWithStatus("active")}
          >
            {isPending ? "Publication…" : "Publier"}
          </Button>
        </div>
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

  const readinessVariants = useMemo(
    () =>
      product.variants.map((v) => ({
        stockQuantity: v.stockQuantity,
        weightGrams: v.weightGrams,
        isActive: v.isActive,
        priceCents: v.priceCents,
        sizeLabel: v.sizeLabel,
        ageLabel: v.ageLabel,
      })),
    [product.variants],
  );

  const saveWithStatus = (targetStatus: ProductStatus) => {
    form.handleSubmit((values) => {
      if (targetStatus === "active") {
        const issues = getProductReadinessIssues({
          images: mapImagesToReadiness(product.images),
          variants: readinessVariants,
          categoryId: values.categoryId,
          slug: values.slug || product.slug,
        });
        if (!isReadyToPublish(issues)) {
          setSubmitError(formatPublishBlockMessage(issues));
          return;
        }
      }

      startTransition(async () => {
        setSubmitError(null);
        const result = await updateProductAction({
          ...values,
          status: targetStatus,
          id: product.id,
        });
        if (result.error) setSubmitError(result.error);
        else router.refresh();
      });
    })();
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <ProductStatusActions
          productId={product.id}
          status={product.status}
          hasOrders={product.hasOrders}
          images={product.images}
          variants={readinessVariants}
          categoryId={watched.categoryId || product.categoryId}
          slug={watchedSlug}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveWithStatus(product.status === "active" ? "active" : "draft");
          }}
          className="space-y-8"
        >
          <ProductFormFields
            register={form.register}
            errors={form.formState.errors}
            categories={categories}
            onSlugManualEdit={() => setSlugTouched(true)}
            hideStatus
          />

          <ProductReadinessAlerts
            images={product.images}
            variants={readinessVariants}
            categoryId={watched.categoryId || product.categoryId}
            slug={watchedSlug}
          />

          <ProductSeoFields register={form.register} />

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="outline" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {product.status !== "active" ? (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => saveWithStatus("active")}
              >
                {isPending ? "Publication…" : "Publier"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => saveWithStatus("draft")}
              >
                Remettre en brouillon
              </Button>
            )}
          </div>
        </form>

        <section className="space-y-4 border-t pt-8">
          <h2 className="text-base font-semibold">Tailles, âges & stock</h2>
          <ProductVariantsManager
            productId={product.id}
            productSlug={watchedSlug}
            variants={product.variants}
          />
        </section>

        <section className="space-y-4 border-t pt-8">
          <h2 className="text-base font-semibold">Photos</h2>
          <ProductImagesManager
            productId={product.id}
            productName={watchedName}
            images={product.images}
          />
          <ProductPhotoReadinessChecklist
            images={mapImagesToReadiness(product.images)}
            secondHand={
              isLikelySecondHandProduct(watched.description) ||
              isLikelySecondHandProduct(watched.shortDescription) ||
              isLikelySecondHandProduct(product.description) ||
              isLikelySecondHandProduct(product.shortDescription)
            }
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
