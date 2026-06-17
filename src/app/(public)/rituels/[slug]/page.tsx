import { notFound } from "next/navigation";

import { CatalogueRayonBanner } from "@/components/catalogue/catalogue-rayon-header";
import { RitualDetailContent } from "@/components/rituals/ritual-detail-content";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { getAllRitualSlugs, getRitualBySlug } from "@/lib/rituals/rituals";
import { pickProductsForRitual } from "@/lib/rituals/pick-ritual-products";
import { RITUAL_CAPSULE_SIZES_CTA } from "@/lib/rituals/ritual-capsule";
import { buildPageMetadata } from "@/lib/seo/metadata";
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
    return { title: "Capsule introuvable", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    title: `${ritual.title} — Capsule à composer`,
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

  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Capsules", path: "/#home-rituals-title" },
    { name: ritual.title, path: `/rituels/${ritual.slug}` },
  ];

  return (
    <div className="container-tilouki section-tilouki overflow-x-hidden pb-6 md:pb-10">
      <Breadcrumbs items={breadcrumbs} className="mb-3" />

      <header className="mb-4 space-y-3 sm:mb-5">
        <CatalogueRayonBanner
          title={ritual.title}
          productCount={products.length}
          eyebrow="Capsule"
          image={{ src: ritualImage.src, alt: ritualImage.alt }}
          cta={{
            label: RITUAL_CAPSULE_SIZES_CTA,
            href: ritual.catalogueHref,
          }}
        />
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {ritual.promise}
        </p>
      </header>

      <div id="ritual-products" className="scroll-mt-24">
        <RitualDetailContent ritual={ritual} products={products} />
      </div>
    </div>
  );
}
