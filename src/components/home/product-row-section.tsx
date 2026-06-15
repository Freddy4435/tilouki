import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ButtonLink } from "@/components/ui/button-link";
import { MIN_HOME_SECTION_PRODUCTS } from "@/lib/catalog/home-sections";
import type { ProductListItem } from "@/types/catalog";

interface ProductRowSectionProps {
  title: string;
  description: string;
  products: ProductListItem[];
  viewAllHref: string;
  /** Ancre pour liens internes (ex. bandeau hero) */
  id?: string;
  /** Fond alterné pour rythme visuel */
  variant?: "default" | "tinted";
  /** Nombre minimum de produits vendables pour afficher la section */
  minProducts?: number;
  /** Limite d'images `priority` pour le LCP (0 = aucune). */
  priorityLimit?: number;
  /** Rendu différé navigateur (sections sous la ligne de flottaison). */
  deferRender?: boolean;
}

export function ProductRowSection({
  title,
  description,
  products,
  viewAllHref,
  id,
  variant = "default",
  minProducts = MIN_HOME_SECTION_PRODUCTS,
  priorityLimit,
  deferRender = false,
}: ProductRowSectionProps) {
  if (products.length < minProducts) {
    return null;
  }

  return (
    <section
      id={id}
      className={
        variant === "tinted"
          ? "border-tilouki-jade/15 bg-tilouki-cloud/40 scroll-mt-20 border-y py-10 md:py-12"
          : "scroll-mt-20 py-10 md:py-12"
      }
      style={
        deferRender
          ? { contentVisibility: "auto", containIntrinsicSize: "0 520px" }
          : undefined
      }
    >
      <div className="container-tilouki">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-section-title">{title}</h2>
            <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
              {description}
            </p>
          </div>
          <ButtonLink
            href={viewAllHref}
            variant="outline"
            className="hidden min-h-10 sm:inline-flex"
          >
            Voir tout
          </ButtonLink>
        </div>
        <CatalogueProductList
          products={products}
          layout="scroll-mobile"
          priorityLimit={priorityLimit}
        />
        <div className="mt-6 sm:hidden">
          <ButtonLink href={viewAllHref} variant="outline" className="min-h-11 w-full">
            Voir tout — {title}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
