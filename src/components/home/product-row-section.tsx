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
}

export function ProductRowSection({
  title,
  description,
  products,
  viewAllHref,
  emptyTitle,
  emptyDescription,
}: ProductRowSectionProps) {
  return (
    <section className="container-tilouki py-10 md:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        </div>
        <ButtonLink href={viewAllHref} variant="outline" className="hidden rounded-full sm:inline-flex">
          Voir tout
        </ButtonLink>
      </div>
      <CatalogueProductList
        products={products}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </section>
  );
}
