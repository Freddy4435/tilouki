import Link from "next/link";
import { ArrowRight, BookOpen, Mail, Ruler } from "lucide-react";

import { RitualCard } from "@/components/rituals/ritual-card";
import { EditorialImage } from "@/components/media/editorial-image";
import { ButtonLink } from "@/components/ui/button-link";
import { getRitualsForCatalogueLaunch } from "@/lib/rituals/rituals";

export function CatalogueLaunchState() {
  const rituals = getRitualsForCatalogueLaunch();

  return (
    <div className="space-y-10 md:space-y-12" data-testid="catalogue-launch">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <EditorialImage
          imageId="nursery-wardrobe"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="aspect-[5/3] max-h-72 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] lg:aspect-[16/10] lg:max-h-none"
        />
        <div className="space-y-4">
          <p className="text-retail-label text-tilouki-teal-dark">Chaque mercredi</p>
          <h2 className="text-section-title text-balance">
            Le catalogue Tilouki arrive
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            La boutique se prépare avec soin : pièces choisies, tailles affichées
            honnêtement, photos réelles. En attendant les premières arrivées, explorez
            nos conseils et inscrivez-vous pour être informé.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/guide-tailles" className="min-h-11">
              <Ruler className="size-4" aria-hidden />
              L&apos;atelier des tailles
            </ButtonLink>
            <ButtonLink href="/blog" variant="outline" className="min-h-11">
              <BookOpen className="size-4" aria-hidden />
              Le Carnet Tilouki
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="bg-card grid gap-5 rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
        <EditorialImage
          imageId="newsletter"
          fill
          sizes="120px"
          className="relative mx-auto h-20 w-[7.5rem] shrink-0 rounded-[var(--radius-button)] sm:mx-0"
        />
        <div className="space-y-3 text-center sm:text-left">
          <h3 className="font-display text-lg font-semibold">Une fois par mois, sans spam</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Nouveautés du mercredi, conseils tailles et petits prix — inscrivez-vous en
            bas de page pour être informé en premier.
          </p>
          <ButtonLink href="/#newsletter" variant="outline" className="min-h-11">
            <Mail className="size-4" aria-hidden />
            S&apos;inscrire à la newsletter
          </ButtonLink>
        </div>
      </div>

      <section aria-labelledby="catalogue-launch-rituals-title">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-retail-label text-tilouki-teal-dark mb-1">En attendant</p>
            <h3 id="catalogue-launch-rituals-title" className="text-section-title">
              Trois rituels doux
            </h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Des moments du quotidien famille — lectures et idées, même sans produit en
              ligne.
            </p>
          </div>
          <Link
            href="/"
            className="text-tilouki-teal-dark text-sm font-semibold underline-offset-4 hover:underline"
          >
            Retour à Tilouki
            <ArrowRight className="ml-1 inline size-3.5" aria-hidden />
          </Link>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {rituals.map((ritual) => (
            <li key={ritual.slug}>
              <RitualCard ritual={ritual} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
