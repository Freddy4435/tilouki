import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import type { ProductListItem } from "@/types/catalog";

interface BlogArticleProductsProps {
  title: string;
  description: string;
  products: ProductListItem[];
  categoryHref: string | null;
}

export function BlogArticleProducts({
  title,
  description,
  products,
  categoryHref,
}: BlogArticleProductsProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="blog-related-products-title" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2
            id="blog-related-products-title"
            className="font-heading text-lg font-semibold"
          >
            {title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
        {categoryHref ? (
          <Link
            href={categoryHref}
            className="text-tilouki-teal-dark inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline"
          >
            Toute la sélection
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>

      <CatalogueProductList
        products={products}
        layout="scroll-mobile"
        priorityLimit={2}
      />
    </section>
  );
}
