import Link from "next/link";
import { ArrowRight, BookOpen, Mail } from "lucide-react";

import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { EditorialImage } from "@/components/media/editorial-image";
import { ButtonLink } from "@/components/ui/button-link";
import { getBlogArticleBySlug } from "@/content/blog/articles";
import { getPrimaryBlogSlug, type Ritual } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

interface RitualDetailContentProps {
  ritual: Ritual;
  products: ProductListItem[];
}

function RitualEmptyState({ ritual }: { ritual: Ritual }) {
  const blogSlug = getPrimaryBlogSlug(ritual);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
      <div className="bg-card space-y-4 rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <h2 className="font-display text-lg font-semibold">{ritual.emptyStateTitle}</h2>
        <ul className="space-y-3">
          {ritual.emptyStateTips.map((tip) => (
            <li
              key={tip}
              className="text-muted-foreground flex gap-2 text-sm leading-relaxed"
            >
              <span className="bg-tilouki-jade-soft text-tilouki-teal-dark mt-1.5 size-1.5 shrink-0 rounded-full" />
              {tip}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
          <ButtonLink href={`/blog/${blogSlug}`} className="min-h-11">
            Lire sur le carnet
            <BookOpen className="size-4" />
          </ButtonLink>
          <ButtonLink href="/#newsletter" variant="outline" className="min-h-11">
            Être prévenu·e des arrivées
            <Mail className="size-4" />
          </ButtonLink>
        </div>
      </div>
      <EditorialImage
        imageId={ritual.imageId}
        fill
        sizes="(max-width: 1024px) 100vw, 42vw"
        className="aspect-[4/3] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 ring-black/[0.04]"
      />
    </div>
  );
}

export function RitualDetailContent({ ritual, products }: RitualDetailContentProps) {
  const hasProducts = products.length > 0;
  const blogSlug = getPrimaryBlogSlug(ritual);

  return (
    <div className="space-y-10">
      {hasProducts ? (
        <section aria-labelledby="ritual-products-title">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="ritual-products-title" className="text-section-title">
                Pièces pour ce moment
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Sélection actuelle en stock — tailles affichées sur chaque fiche.
              </p>
            </div>
            <ButtonLink href={ritual.catalogueHref} variant="outline" className="min-h-10">
              {ritual.ctaLabel}
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
          <CatalogueProductList products={products} layout="scroll-mobile" priorityLimit={0} />
        </section>
      ) : (
        <RitualEmptyState ritual={ritual} />
      )}

      <section
        className="bg-tilouki-cloud/50 border-tilouki-jade/10 rounded-[var(--radius-card)] border p-5 sm:p-6"
        aria-labelledby="ritual-read-more-title"
      >
        <h2 id="ritual-read-more-title" className="font-display text-lg font-semibold">
          À lire aussi
        </h2>
        <ul className="mt-3 space-y-2">
          {ritual.blogSlugs.map((slug) => {
            const article = getBlogArticleBySlug(slug);
            return (
              <li key={slug}>
                <Link
                  href={`/blog/${slug}`}
                  className="text-tilouki-teal-dark inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  {article?.title ?? slug}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
        {!hasProducts ? (
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            Le vestiaire se remplit au fil des mercredis. En attendant, le{" "}
            <Link href={`/blog/${blogSlug}`} className="text-tilouki-teal-dark font-medium">
              carnet Tilouki
            </Link>{" "}
            et la{" "}
            <Link href="/#newsletter" className="text-tilouki-teal-dark font-medium">
              newsletter
            </Link>{" "}
            vous tiennent compagnie.
          </p>
        ) : null}
      </section>
    </div>
  );
}
