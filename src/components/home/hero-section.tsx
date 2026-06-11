import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { ButtonLink } from "@/components/ui/button-link";
import { formatPrice } from "@/lib/utils";

export interface HeroFeaturedProduct {
  slug: string;
  name: string;
  primaryImageUrl: string | null;
  minPriceCents: number;
  categoryName?: string | null;
}

interface HeroSectionProps {
  shopName: string;
  tagline: string;
  description: string;
  heroImageUrl?: string | null;
  featuredProducts?: HeroFeaturedProduct[];
  categoryLinks?: { slug: string; label: string }[];
}

function HeroVisualFallback() {
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none"
      aria-hidden
    >
      <div className="from-tilouki-blue-soft via-tilouki-cream to-tilouki-sage-light absolute inset-0 rounded-[1.75rem] bg-gradient-to-br shadow-[var(--shadow-card)]" />
      <div className="bg-card absolute top-[12%] right-[8%] left-[14%] rounded-2xl p-4 shadow-[var(--shadow-soft)]">
        <div className="from-tilouki-rose-soft to-tilouki-blue-soft mb-3 aspect-[3/4] rounded-xl bg-gradient-to-br" />
        <div className="space-y-2">
          <div className="bg-muted h-2.5 w-3/4 rounded-full" />
          <div className="bg-muted h-2 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="bg-tilouki-sage text-tilouki-sage-dark absolute bottom-[18%] left-[6%] rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
        Dès 9,90 €
      </div>
    </div>
  );
}

function HeroPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-card)] ring-1 ring-black/[0.05] lg:max-w-none">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 48vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tilouki-ink/25 via-transparent to-transparent" />
    </div>
  );
}

function HeroProductMosaic({ products }: { products: HeroFeaturedProduct[] }) {
  const items = products.filter((p) => p.primaryImageUrl).slice(0, 4);
  if (items.length === 0) return <HeroVisualFallback />;

  const layout = [
    "col-span-7 row-span-4",
    "col-span-5 row-span-2",
    "col-span-5 row-span-2",
    "col-span-12 row-span-2 sm:col-span-12",
  ] as const;

  return (
    <div
      className="relative mx-auto grid w-full max-w-md grid-cols-12 grid-rows-6 gap-2 sm:gap-2.5 lg:max-w-none"
      style={{ aspectRatio: "4/5", maxHeight: "min(72vh, 560px)" }}
    >
      {items.map((product, index) => (
        <Link
          key={product.slug}
          href={`/produit/${product.slug}`}
          className={`group relative overflow-hidden rounded-2xl bg-tilouki-beige shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-shadow hover:shadow-[var(--shadow-card)] ${layout[index] ?? layout[3]}`}
        >
          {product.primaryImageUrl ? (
            <Image
              src={product.primaryImageUrl}
              alt={product.name}
              fill
              priority={index === 0}
              sizes="(max-width: 640px) 45vw, 22vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-tilouki-ink/55 via-tilouki-ink/5 to-transparent" />
          <div className="absolute right-2 bottom-2 left-2 flex items-end justify-between gap-2">
            <p className="line-clamp-2 text-xs font-medium text-white drop-shadow-sm sm:text-sm">
              {product.name}
            </p>
            <span className="bg-card/95 text-foreground shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
              {formatPrice(product.minPriceCents)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HeroSection({
  shopName,
  tagline,
  description,
  heroImageUrl,
  featuredProducts = [],
  categoryLinks = [],
}: HeroSectionProps) {
  const visual = heroImageUrl ? (
    <HeroPhoto src={heroImageUrl} alt={`Collection enfants — ${shopName}`} />
  ) : (
    <HeroProductMosaic products={featuredProducts} />
  );

  return (
    <section className="relative overflow-hidden border-b border-tilouki-blue/10 bg-gradient-to-b from-tilouki-blue-soft/50 via-background to-tilouki-sage-light/30">
      <div className="pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-tilouki-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-20 size-64 rounded-full bg-tilouki-sage/25 blur-3xl" />

      <div className="container-tilouki relative py-8 sm:py-12 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="text-tilouki-sage-dark mb-3 inline-flex items-center gap-2 rounded-full border border-tilouki-sage/25 bg-tilouki-sage-light/60 px-3 py-1 text-xs font-semibold tracking-wide uppercase sm:text-sm">
              <Sparkles className="size-3.5" aria-hidden />
              {tagline}
            </p>
            <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              Mode enfant douce,{" "}
              <span className="text-primary">prête à porter</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-sm leading-relaxed sm:text-base lg:mx-0">
              {description}
            </p>

            <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <ButtonLink
                href="/catalogue"
                size="lg"
                className="min-h-11 w-full rounded-full sm:min-w-[15rem] sm:w-auto"
              >
                Voir la boutique
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href="/catalogue?promo=petit-prix"
                variant="outline"
                size="lg"
                className="min-h-11 w-full rounded-full border-tilouki-blue/30 bg-card/80 sm:w-auto"
              >
                Petits prix
              </ButtonLink>
            </div>

            {categoryLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                {categoryLinks.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categorie/${cat.slug}`}
                    className="bg-card/90 text-foreground hover:border-primary/30 inline-flex min-h-9 items-center rounded-full border border-border/70 px-3.5 text-xs font-medium transition-colors sm:text-sm"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-6 hidden sm:block lg:mt-8">
              <ReassuranceStrip className="lg:justify-start" />
            </div>
          </div>

          <div className="order-1 lg:order-2">{visual}</div>
        </div>
      </div>
    </section>
  );
}
