import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { formatPrice } from "@/lib/utils";
import type { ReadyLook } from "@/lib/catalog/home-sections";

interface HomeReadyLooksSectionProps {
  looks: ReadyLook[];
}

function ReadyLookProductThumb({
  slug,
  name,
  imageUrl,
  priceCents,
}: {
  slug: string;
  name: string;
  imageUrl: string;
  priceCents: number;
}) {
  return (
    <Link
      href={`/produit/${slug}`}
      className="bg-card group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-button)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04]"
    >
      <Image
        src={imageUrl}
        alt={name}
        fill
        loading="lazy"
        sizes="120px"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span className="bg-card/95 text-foreground absolute right-1 bottom-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
        {formatPrice(priceCents)}
      </span>
    </Link>
  );
}

export function HomeReadyLooksSection({ looks }: HomeReadyLooksSectionProps) {
  if (looks.length === 0) return null;

  return (
    <section
      id="home-looks-prets"
      className="border-tilouki-powder/20 bg-tilouki-powder-soft/25 scroll-mt-20 border-y py-10 md:py-12"
      aria-labelledby="home-looks-title"
    >
      <div className="container-tilouki">
        <div className="mb-6 max-w-2xl">
          <p className="text-retail-label text-tilouki-plum">Idées tenues</p>
          <h2 id="home-looks-title" className="text-section-title mt-1">
            Looks prêts
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
            Des associations simples pour habiller vos enfants sans y passer une heure —
            ou des conseils pratiques quand la sélection s&apos;étoffe.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {looks.map((look) => (
            <article
              key={look.id}
              className="bg-card flex flex-col rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04]"
            >
              <h3 className="font-display text-lg leading-snug font-semibold">
                {look.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {look.hook}
              </p>

              {look.products.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {look.products.map((product) =>
                    product.primaryImageUrl ? (
                      <ReadyLookProductThumb
                        key={product.id}
                        slug={product.slug}
                        name={product.name}
                        imageUrl={product.primaryImageUrl}
                        priceCents={product.minPriceCents}
                      />
                    ) : null,
                  )}
                </div>
              ) : (
                <div className="bg-tilouki-jade-soft/60 mt-4 flex gap-2.5 rounded-[var(--radius-button)] p-3">
                  <Lightbulb
                    className="text-tilouki-teal-dark mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  <p className="text-foreground text-xs leading-relaxed sm:text-sm">
                    {look.tip}
                  </p>
                </div>
              )}

              <ButtonLink
                href={look.href}
                variant={look.editorialOnly ? "outline" : "default"}
                size="sm"
                className="mt-4 min-h-10 w-full sm:w-auto"
              >
                {look.editorialOnly ? "Lire le conseil" : "Composer ce look"}
                <ArrowRight className="size-4" />
              </ButtonLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
