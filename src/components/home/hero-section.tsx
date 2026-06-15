import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CreditCard, RotateCcw, Truck } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { cn, formatPrice } from "@/lib/utils";

export interface HeroFeaturedProduct {
  slug: string;
  name: string;
  primaryImageUrl: string | null;
  minPriceCents: number;
  categoryName?: string | null;
}

interface HeroSectionProps {
  shopName: string;
  heroImageUrl?: string | null;
  featuredProducts?: HeroFeaturedProduct[];
  categoryLinks?: { slug: string; label: string }[];
}

const HERO_BASELINE = "Des vêtements doux, choisis pour grandir bien.";

const HERO_CATEGORY_SLUGS = ["bebe", "fille", "garcon", "pyjamas"] as const;

const CATEGORY_FALLBACK_LABELS: Record<(typeof HERO_CATEGORY_SLUGS)[number], string> = {
  bebe: "Bébé",
  fille: "Fille",
  garcon: "Garçon",
  pyjamas: "Pyjamas",
};

const REASSURANCE_ITEMS = [
  { icon: CreditCard, label: "Paiement sécurisé" },
  { icon: RotateCcw, label: "Retours 14 jours" },
  { icon: Truck, label: "Livraison point relais" },
] as const;

type HeroVisualMode = "mosaic" | "single-product" | "admin-photo" | "brand";

function resolveHeroVisualMode(
  products: HeroFeaturedProduct[],
  heroImageUrl?: string | null,
): HeroVisualMode {
  const withPhotos = products.filter((p) => p.primaryImageUrl);
  if (withPhotos.length >= 2) return "mosaic";
  if (withPhotos.length === 1) return "single-product";
  if (heroImageUrl) return "admin-photo";
  return "brand";
}

function HeroBrandSurface() {
  return (
    <div className="bg-tilouki-cloud border-tilouki-jade/25 relative flex aspect-[4/5] max-h-[min(68vh,520px)] flex-col justify-between overflow-hidden rounded-[var(--radius-product)] border p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div
        className="bg-tilouki-jade/20 pointer-events-none absolute -top-16 -right-10 size-56 rounded-full"
        aria-hidden
      />
      <div
        className="bg-tilouki-powder-soft/70 pointer-events-none absolute -bottom-12 -left-10 size-44 rounded-full"
        aria-hidden
      />
      <div className="relative max-w-sm space-y-2">
        <p className="text-retail-label text-tilouki-teal-dark">
          Boutique indépendante
        </p>
        <p className="font-display text-2xl leading-snug font-semibold text-balance lg:text-[1.75rem]">
          Des pièces choisies avec douceur pour accompagner le quotidien de vos enfants.
        </p>
      </div>
      <p className="text-muted-foreground relative max-w-xs text-sm leading-relaxed">
        Stock et tailles affichés sur chaque fiche — une sélection honnête, sans fausse
        photo.
      </p>
    </div>
  );
}

function HeroProductMosaic({ products }: { products: HeroFeaturedProduct[] }) {
  const items = products.filter((p) => p.primaryImageUrl).slice(0, 4);
  if (items.length < 2) return null;

  const layout = [
    "col-span-7 row-span-4",
    "col-span-5 row-span-2",
    "col-span-5 row-span-2",
    "col-span-12 row-span-2",
  ] as const;

  return (
    <div
      className="grid w-full grid-cols-12 grid-rows-6 gap-2.5"
      style={{ aspectRatio: "4/5", maxHeight: "min(68vh, 520px)" }}
    >
      {items.map((product, index) => (
        <Link
          key={product.slug}
          href={`/produit/${product.slug}`}
          className={cn(
            "group bg-tilouki-jade-soft relative overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-shadow hover:shadow-[var(--shadow-card)]",
            layout[index] ?? layout[3],
          )}
        >
          <Image
            src={product.primaryImageUrl!}
            alt={product.name}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 50vw, 22vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="from-tilouki-ink/50 via-tilouki-ink/5 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              {product.categoryName ? (
                <p className="text-retail-label text-white/85">
                  {product.categoryName}
                </p>
              ) : null}
              <p className="line-clamp-2 text-xs font-semibold text-white drop-shadow-sm sm:text-sm">
                {product.name}
              </p>
            </div>
            <span className="bg-card text-foreground shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums">
              {formatPrice(product.minPriceCents)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Bandeau visuel mobile — cible LCP (image prioritaire au-dessus de la ligne de flottaison). */
function HeroMobileFeatured({
  product,
  heroImageUrl,
  shopName,
}: {
  product: HeroFeaturedProduct | null;
  heroImageUrl?: string | null;
  shopName: string;
}) {
  const imageUrl = product?.primaryImageUrl ?? heroImageUrl;
  if (!imageUrl) return null;

  const alt = product?.name ?? `Univers ${shopName}`;
  const href = product ? `/produit/${product.slug}` : "#home-nouveautes";

  return (
    <Link
      href={href}
      className="group bg-tilouki-jade-soft relative mb-1 block aspect-[5/3] max-h-44 overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] lg:hidden"
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div className="from-tilouki-ink/50 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      {product ? (
        <div className="absolute right-3 bottom-2.5 left-3">
          <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow-sm">
            {product.name}
          </p>
          <span className="bg-card text-foreground mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
            {formatPrice(product.minPriceCents)}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

function HeroSingleProduct({ product }: { product: HeroFeaturedProduct }) {
  if (!product.primaryImageUrl) return null;

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group bg-tilouki-jade-soft relative block aspect-[4/5] max-h-[min(68vh,520px)] overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-card)] ring-1 ring-black/[0.04]"
    >
      <Image
        src={product.primaryImageUrl}
        alt={product.name}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 48vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div className="from-tilouki-ink/45 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      <div className="absolute right-3 bottom-3 left-3">
        <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow-sm">
          {product.name}
        </p>
        <span className="bg-card text-foreground mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold tabular-nums">
          {formatPrice(product.minPriceCents)}
        </span>
      </div>
    </Link>
  );
}

function HeroAdminPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/5] max-h-[min(68vh,520px)] overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-card)] ring-1 ring-black/[0.05]">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 48vw"
        className="object-cover"
      />
      <div className="from-tilouki-ink/20 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
    </div>
  );
}

function HeroVisualColumn({
  mode,
  shopName,
  heroImageUrl,
  products,
}: {
  mode: HeroVisualMode;
  shopName: string;
  heroImageUrl?: string | null;
  products: HeroFeaturedProduct[];
}) {
  const withPhotos = products.filter((p) => p.primaryImageUrl);

  return (
    <div className="hidden lg:block">
      {mode === "mosaic" ? <HeroProductMosaic products={withPhotos} /> : null}
      {mode === "single-product" && withPhotos[0] ? (
        <HeroSingleProduct product={withPhotos[0]} />
      ) : null}
      {mode === "admin-photo" && heroImageUrl ? (
        <HeroAdminPhoto src={heroImageUrl} alt={`Univers ${shopName}`} />
      ) : null}
      {mode === "brand" ? <HeroBrandSurface /> : null}
    </div>
  );
}

function HeroCategoryShortcuts({
  categories,
}: {
  categories: { slug: string; label: string }[];
}) {
  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Parcourir par catégorie"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/categorie/${cat.slug}`}
          className="bg-card text-foreground hover:border-tilouki-teal/40 hover:text-tilouki-teal-dark inline-flex min-h-10 items-center justify-center rounded-[var(--radius-button)] border px-2 text-center text-xs font-semibold transition-colors sm:min-h-11 sm:text-sm"
        >
          {cat.label}
        </Link>
      ))}
    </nav>
  );
}

function HeroReassurance() {
  return (
    <ul className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
      {REASSURANCE_ITEMS.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1">
          <item.icon className="text-tilouki-teal size-3 shrink-0" aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function HeroNextPeek() {
  return (
    <Link
      href="#home-nouveautes"
      className="border-border/70 bg-tilouki-cloud/50 hover:bg-tilouki-jade-soft/35 mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3 transition-colors sm:mt-5"
    >
      <div>
        <p className="text-retail-label text-tilouki-teal-dark">À découvrir</p>
        <p className="text-foreground mt-0.5 text-sm font-semibold">
          Les nouveautés du mercredi
        </p>
      </div>
      <ArrowRight className="text-tilouki-teal-dark size-4 shrink-0" aria-hidden />
    </Link>
  );
}

export function HeroSection({
  shopName,
  heroImageUrl,
  featuredProducts = [],
  categoryLinks = [],
}: HeroSectionProps) {
  const visualMode = resolveHeroVisualMode(featuredProducts, heroImageUrl);
  const withPhotos = featuredProducts.filter((p) => p.primaryImageUrl);
  const mobileFeatured = withPhotos[0] ?? null;

  const quickCategories = HERO_CATEGORY_SLUGS.map((slug) => {
    const fromDb = categoryLinks.find((cat) => cat.slug === slug);
    return {
      slug,
      label: fromDb?.label ?? CATEGORY_FALLBACK_LABELS[slug],
    };
  });

  return (
    <section
      aria-labelledby="hero-heading"
      className="border-border/60 bg-background border-b"
    >
      <div className="container-tilouki pt-3 pb-4 sm:pt-5 sm:pb-5 lg:pt-8 lg:pb-6">
        <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10">
          <div className="flex flex-col gap-3 sm:gap-3.5">
            <HeroMobileFeatured
              product={mobileFeatured}
              heroImageUrl={heroImageUrl}
              shopName={shopName}
            />
            <div className="space-y-2">
              <p className="text-retail-label text-tilouki-teal-dark">
                Vêtements enfants
              </p>
              <h1 id="hero-heading" className="text-editorial-title">
                {shopName}
              </h1>
              <p className="text-tilouki-teal-dark max-w-md text-base font-medium text-balance sm:text-lg">
                {HERO_BASELINE}
              </p>
            </div>

            <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap">
              <ButtonLink
                href="#home-nouveautes"
                size="lg"
                className="min-h-11 flex-1 sm:flex-none"
              >
                Voir les nouveautés
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href="#home-guide-tailles"
                variant="outline"
                size="lg"
                className="min-h-11 flex-1 sm:flex-none"
              >
                Trouver par âge
              </ButtonLink>
            </div>

            <HeroCategoryShortcuts categories={quickCategories} />
            <HeroReassurance />
            <HeroNextPeek />
          </div>

          <HeroVisualColumn
            mode={visualMode}
            shopName={shopName}
            heroImageUrl={heroImageUrl}
            products={featuredProducts}
          />
        </div>
      </div>
    </section>
  );
}
