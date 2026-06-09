"use client";

import { ExternalLink } from "lucide-react";

import { buildProductPreview } from "@/lib/admin/product-preview";
import { ProductAccordions } from "@/components/product/product-accordions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminProductDetail } from "@/lib/supabase/queries/admin/products";
import type { ProductGender } from "@/types/database";

interface ProductPreviewPanelProps {
  product: AdminProductDetail | null;
  values: {
    name: string;
    slug: string;
    shortDescription?: string | null;
    description?: string | null;
    material?: string | null;
    season?: string | null;
    brandLabel?: string;
    madeIn?: string | null;
    careInstructions?: string | null;
    gender: ProductGender;
    categoryName?: string | null;
  };
  images: AdminProductDetail["images"];
  variants: AdminProductDetail["variants"];
}

export function ProductPreviewPanel({
  product,
  values,
  images,
  variants,
}: ProductPreviewPanelProps) {
  const preview = buildProductPreview(product, {
    ...values,
    images,
    variants,
  });

  const publicHref = values.slug ? `/produit/${values.slug}` : null;

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-base">Prévisualisation</CardTitle>
        {product && publicHref && product.status === "active" ? (
          <ButtonLink href={publicHref} variant="outline" size="sm" target="_blank">
            <ExternalLink className="size-3.5" />
            Voir en ligne
          </ButtonLink>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="pointer-events-none max-h-[70vh] overflow-y-auto rounded-lg border p-3">
          <div className="grid gap-4">
            <ProductGallery images={preview.images} productName={preview.name} />
            <ProductPurchasePanel product={preview} />
            <ProductAccordions product={preview} />
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Aperçu basé sur les données saisies. Le bouton panier est désactivé en mode admin.
        </p>
      </CardContent>
    </Card>
  );
}
