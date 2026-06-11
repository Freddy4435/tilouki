import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ButtonLink } from "@/components/ui/button-link";
import type { ProductListItem } from "@/types/catalog";

interface ProductRowSectionProps {
  title: string;
  description: string;
  products: ProductListItem[];
  viewAllHref: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Fond alterné pour rythme visuel */
  variant?: "default" | "tinted";
}

export function ProductRowSection({
  title,
  description,
  products,
  viewAllHref,
  emptyTitle,
  emptyDescription,
  variant = "default",
}: ProductRowSectionProps) {
  return (
    <section
      className={
        variant === "tinted"
          ? "border-y border-tilouki-sage/10 bg-gradient-to-b from-tilouki-sage-light/25 to-background py-10 md:py-12"
          : "py-10 md:py-12"
      }
    >
      <div className="container-tilouki">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
          </div>
          <ButtonLink
            href={viewAllHref}
            variant="outline"
            className="hidden min-h-10 rounded-full sm:inline-flex"
          >
            Voir tout
          </ButtonLink>
        </div>
        <CatalogueProductList
          products={products}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
        {products.length > 0 ? (
          <div className="mt-6 sm:hidden">
            <ButtonLink href={viewAllHref} variant="outline" className="min-h-11 w-full rounded-full">
              Voir tout — {title}
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
