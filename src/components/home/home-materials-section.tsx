import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MaterialCard, type MaterialCardData } from "@/components/home/material-card";
import type { EditorialImageId } from "@/lib/media/editorial-images";

const MATERIALS: MaterialCardData[] = [
  {
    id: "coton",
    name: "Coton",
    feel: "Léger, respirant, facile à laver — idéal au quotidien.",
    tip: "Lavage doux à 30 °C : le coton garde sa souplesse au fil des semaines.",
    imageId: "cotton-texture" satisfies EditorialImageId,
    blogHref: "/blog/matieres-douces-vetements-enfants",
  },
  {
    id: "maille",
    name: "Maille",
    feel: "Enveloppant et doux — parfait pour les saisons fraîches.",
    tip: "Choisissez une maille fine sous un sweat : on retire une couche à l'intérieur.",
    imageId: "material-closeup" satisfies EditorialImageId,
    blogHref: "/blog/matieres-douces-vetements-enfants",
  },
  {
    id: "lin",
    name: "Lin",
    feel: "Naturel et aéré — joli rendu, agréable quand il fait doux.",
    tip: "Le lin se froisse naturellement — ce n'est pas un défaut, c'est son charme.",
    imageId: "colors-soft" satisfies EditorialImageId,
    blogHref: "/blog/matieres-douces-vetements-enfants",
  },
  {
    id: "molleton",
    name: "Molleton",
    feel: "Chaleur moelleuse sans être épais — cocooning garanti.",
    tip: "Parfait en pyjama ou jogging d'intérieur : chaud sans être étouffant.",
    imageId: "pajamas-evening" satisfies EditorialImageId,
    blogHref: "/blog/matieres-douces-vetements-enfants",
  },
];

export function HomeMaterialsSection() {
  return (
    <section
      className="home-maison-section maison-surface maison-surface-cloud-texture scroll-mt-20"
      aria-labelledby="home-materials-title"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-retail-label text-tilouki-teal-dark mb-1.5">
              Toucher & confort
            </p>
            <h2 id="home-materials-title" className="text-section-title">
              Matières à regarder de près
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              Ce que l&apos;enfant ressent au contact de la peau compte autant que le
              style. Survolez ou touchez une carte pour un petit conseil.
            </p>
          </div>
          <Link
            href="/blog/matieres-douces-vetements-enfants"
            className="text-tilouki-teal-dark inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
          >
            Tout lire sur les matières
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {MATERIALS.map((material) => (
            <li key={material.id}>
              <MaterialCard material={material} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
