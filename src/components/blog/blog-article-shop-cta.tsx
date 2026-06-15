import Link from "next/link";
import { ArrowRight, Ruler, ShoppingBag } from "lucide-react";

import type { BlogCategory } from "@/content/blog/articles";
import { ButtonLink } from "@/components/ui/button-link";
import {
  getBlogCategoryCatalogMeta,
  resolveBlogArticleCta,
  type BlogArticlePrimaryCta,
} from "@/lib/blog/category-catalog";
import { NAV_HREF } from "@/lib/navigation/nav-config";

interface BlogArticleShopCtaProps {
  category: BlogCategory;
  catalogueHasProducts: boolean;
}

function CtaCopy({
  variant,
  catalogueHref,
}: {
  variant: BlogArticlePrimaryCta;
  catalogueHref: string;
}) {
  if (variant === "guide-tailles") {
    return (
      <>
        <Ruler className="text-tilouki-teal-dark size-6" aria-hidden />
        <div className="space-y-2">
          <h3 className="font-heading text-lg font-semibold">L&apos;atelier des tailles</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Indiquez l&apos;âge et l&apos;usage pour un conseil rapide — puis comparez avec un
            vêtement qui va déjà bien à l&apos;enfant.
          </p>
        </div>
        <ButtonLink href={NAV_HREF.guideTailles} className="w-fit rounded-full">
          Ouvrir l&apos;atelier
          <ArrowRight className="size-4" />
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <ShoppingBag className="text-tilouki-teal-dark size-6" aria-hidden />
      <div className="space-y-2">
        <h3 className="font-heading text-lg font-semibold">Explorer la sélection</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Des pièces choisies, tailles affichées clairement et photos honnêtes — pour passer
          du conseil à l&apos;action en douceur.
        </p>
      </div>
      <ButtonLink href={catalogueHref} className="w-fit rounded-full">
        Voir la sélection
        <ArrowRight className="size-4" />
      </ButtonLink>
    </>
  );
}

export function BlogArticleShopCta({ category, catalogueHasProducts }: BlogArticleShopCtaProps) {
  const meta = getBlogCategoryCatalogMeta(category);
  const primaryCta = resolveBlogArticleCta(category, catalogueHasProducts);
  const catalogueHref = meta.catalogueHref;

  return (
    <section
      aria-labelledby="blog-shop-cta-title"
      className="border-tilouki-jade/20 bg-tilouki-cloud/50 space-y-4 rounded-2xl border p-6"
    >
      <h2 id="blog-shop-cta-title" className="font-heading text-lg font-semibold">
        Passer à l&apos;action
      </h2>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-4">
          <CtaCopy variant={primaryCta} catalogueHref={catalogueHref} />
        </div>

        <div className="text-muted-foreground space-y-2 text-sm">
          {primaryCta === "guide-tailles" && catalogueHasProducts ? (
            <Link
              href={catalogueHref}
              className="text-tilouki-teal-dark inline-flex items-center gap-1 font-semibold hover:underline"
            >
              Voir aussi le catalogue
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
          {primaryCta === "catalogue" ? (
            <Link
              href={NAV_HREF.guideTailles}
              className="text-tilouki-teal-dark inline-flex items-center gap-1 font-semibold hover:underline"
            >
              Besoin d&apos;aide sur les tailles ?
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
