import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { RitualDetailContent } from "@/components/rituals/ritual-detail-content";
import { ButtonLink } from "@/components/ui/button-link";
import { getAllRitualSlugs, getRitualBySlug } from "@/lib/rituals/rituals";
import { pickProductsForRitual } from "@/lib/rituals/pick-ritual-products";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import { resolveRitualTiloukiImage } from "@/lib/tilouki-images";
import { getActiveProductsForHome } from "@/lib/supabase/queries/products";
import type { Metadata } from "next";

export const revalidate = 300;

interface RitualPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllRitualSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RitualPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ritual = getRitualBySlug(slug);

  if (!ritual) {
    return { title: "Rituel introuvable", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    title: `${ritual.title} — Sélection à acheter`,
    description: ritual.promise,
    path: `/rituels/${ritual.slug}`,
  });
}

export default async function RitualPage({ params }: RitualPageProps) {
  const { slug } = await params;
  const ritual = getRitualBySlug(slug);

  if (!ritual) {
    notFound();
  }

  const allProducts = await getActiveProductsForHome();
  const products = pickProductsForRitual(allProducts, ritual);
  const ritualImage = resolveRitualTiloukiImage(ritual.slug);

  return (
    <div className="pb-12 md:pb-16">
      <div className="border-tilouki-border/80 border-b bg-tilouki-milk/50">
        <div className="container-tilouki section-tilouki py-6 md:py-8">
          <Link
            href="/"
            className="text-muted-foreground mb-4 inline-flex items-center gap-1.5 text-sm font-medium hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Retour à l&apos;accueil
          </Link>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8">
            <div className="product-gallery-frame relative aspect-[5/3] overflow-hidden rounded-[var(--radius-card)] ring-1 ring-black/[0.04] lg:aspect-[4/3]">
              <Image
                src={ritualImage.src}
                alt={ritualImage.alt}
                fill
                priority
                sizes={IMAGE_SIZES.hero}
                className="object-cover"
              />
            </div>

            <header className="space-y-3">
              <p className="text-retail-label text-tilouki-teal-dark">
                {ritual.primaryCategoryLabel}
              </p>
              <h1 className="text-section-title">{ritual.title}</h1>
              <p className="text-foreground text-sm font-medium leading-relaxed sm:text-base">
                {ritual.promise}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {ritual.description}
              </p>
              <ButtonLink href={ritual.catalogueHref} className="min-h-11">
                {ritual.ctaLabel}
                <ArrowRight className="size-4" />
              </ButtonLink>
            </header>
          </div>
        </div>
      </div>

      <div className="container-tilouki section-tilouki py-8 md:py-10">
        <RitualDetailContent ritual={ritual} products={products} />
      </div>
    </div>
  );
}
