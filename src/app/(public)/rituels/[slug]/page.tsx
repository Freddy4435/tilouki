import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RitualDetailContent } from "@/components/rituals/ritual-detail-content";
import { RitualHeroImage } from "@/components/rituals/ritual-hero-image";
import { getAllRitualSlugs, getRitualBySlug } from "@/lib/rituals/rituals";
import { pickProductsForRitual } from "@/lib/rituals/pick-ritual-products";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getActiveProductsForHome } from "@/lib/supabase/queries/products";

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
    title: `${ritual.title} — Rituels doux`,
    description: ritual.description,
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

  return (
    <div className="pb-12 md:pb-16">
      <div className="border-border/60 relative border-b">
        <div className="relative min-h-[min(42vh,320px)] overflow-hidden">
          <RitualHeroImage slug={ritual.slug} imageId={ritual.imageId} priority />
          <div
            className="from-tilouki-ink/75 via-tilouki-ink/40 absolute inset-0 bg-gradient-to-t to-transparent"
            aria-hidden
          />
          <div className="container-tilouki relative z-10 flex min-h-[min(42vh,320px)] flex-col justify-end py-8 md:py-10 tilouki-motion-fade-up">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Retour à Tilouki
            </Link>
            <p className="text-retail-label text-white/85">Rituels doux</p>
            <h1 className="font-display mt-1 max-w-2xl text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl">
              {ritual.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/92 sm:text-base">
              {ritual.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <RitualDetailContent ritual={ritual} products={products} />
      </div>
    </div>
  );
}
