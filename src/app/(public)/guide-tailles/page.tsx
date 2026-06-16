import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";

import { EditorialImage } from "@/components/media/editorial-image";
import { SizeAtelier } from "@/components/size-guide/size-atelier";
import { SizeAtelierSkeleton } from "@/components/size-guide/size-atelier-skeleton";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { hasActiveCatalogueProducts } from "@/lib/supabase/queries/products";

export const revalidate = 3600;

const PAGE_DESCRIPTION =
  "Choisissez l'âge et l'usage : conseils taille, marge recommandée et matières douces — sans jargon, pour choisir sereinement.";

export const metadata: Metadata = buildPageMetadata({
  title: "L'Atelier des tailles — Guide vêtements enfants",
  description: PAGE_DESCRIPTION,
  path: "/guide-tailles",
});

export default async function GuideTaillesPage() {
  const catalogueHasProducts = await hasActiveCatalogueProducts();

  return (
    <div className="pb-12 md:pb-16">
      <div className="border-border/60 bg-tilouki-cloud/40 border-b">
        <div className="container-tilouki py-8 md:py-10">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Retour à Tilouki
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <p className="text-retail-label text-tilouki-teal-dark mb-2 inline-flex items-center gap-1.5">
                <Ruler className="size-3.5" aria-hidden />
                Aide au choix
              </p>
              <h1 className="text-editorial-title">L&apos;Atelier des tailles</h1>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
                {PAGE_DESCRIPTION} Partagez votre sélection avec un lien — aucune donnée
                personnelle n&apos;est enregistrée.
              </p>
            </div>
            <EditorialImage
              imageId="size-guide"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="aspect-[16/10] max-h-56 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] lg:max-h-64"
            />
          </div>
        </div>
      </div>

      <div className="container-tilouki section-tilouki max-w-3xl py-10 md:py-12 lg:max-w-4xl">
        <Suspense fallback={<SizeAtelierSkeleton />}>
          <SizeAtelier
            variant="full"
            syncUrl
            catalogueHasProducts={catalogueHasProducts}
          />
        </Suspense>
      </div>
    </div>
  );
}
