import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { ButtonLink } from "@/components/ui/button-link";
import { MIN_HOME_SECTION_PRODUCTS } from "@/lib/catalog/home-sections";
import { cn } from "@/lib/utils";
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
  /** Label retail au-dessus du titre */
  eyebrow?: string;
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
  eyebrow,
}: ProductRowSectionProps) {
  if (products.length < minProducts) {
    return null;
  }

  return (
    <section
      id={id}
      className={cn(
        "retail-section scroll-mt-20 py-10 md:py-12",
        variant === "tinted" &&
          "border-tilouki-border/80 maison-surface maison-surface-jade border-y",
      )}
      style={
        deferRender
          ? { contentVisibility: "auto", containIntrinsicSize: "0 520px" }
          : undefined
      }
    >
      <div className="container-tilouki">
        <div className="mb-6 flex items-end justify-between gap-4">
          <header className="retail-section__header">
            <div className="brand-accent-bar" aria-hidden />
            {eyebrow ? (
              <p className="text-retail-label text-tilouki-argile">{eyebrow}</p>
            ) : null}
            <h2 className="text-section-title retail-section__title">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </header>
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
