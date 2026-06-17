import Link from "next/link";
import { ArrowRight, CalendarHeart, Ruler } from "lucide-react";

import { RitualCard } from "@/components/rituals/ritual-card";
import { ArrivageNewsletterCta } from "@/components/newsletter/arrivage-newsletter-cta";
import { ButtonLink } from "@/components/ui/button-link";
import { getRitualsForCatalogueLaunch } from "@/lib/rituals/rituals";
import { resolveCategoryTiloukiImage } from "@/lib/tilouki-images";
import Image from "next/image";

export function CatalogueLaunchState() {
  const rituals = getRitualsForCatalogueLaunch();
  const storefrontImage = resolveCategoryTiloukiImage("nouveautes");

  return (
    <div className="space-y-8 md:space-y-10" data-testid="catalogue-launch">
      <div className="border-tilouki-argile/25 bg-tilouki-argile-soft/25 grid gap-6 rounded-[var(--radius-card)] border p-5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:p-6 lg:grid-cols-[minmax(0,14rem)_1fr]">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[14rem] overflow-hidden rounded-[var(--radius-card)] sm:mx-0">
          <Image
            src={storefrontImage.src}
            alt={storefrontImage.alt}
            fill
            sizes="224px"
            className="object-cover"
            priority
          />
        </div>
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-retail-label text-tilouki-pistache inline-flex items-center justify-center gap-1.5 sm:justify-start">
            <CalendarHeart className="size-3.5" aria-hidden />
            Arrivage du mercredi
          </p>
          <h2 className="text-section-title text-balance">Le catalogue s&apos;ouvre</h2>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            Premières pièces en ligne très bientôt — tailles et stock affichés sur
            chaque fiche. En attendant, parcourez les capsules déjà prêtes.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/catalogue?vue=capsules" className="min-h-11">
              Voir les capsules proches
            </ButtonLink>
            <ButtonLink href="/guide-tailles" variant="outline" className="min-h-11">
              <Ruler className="size-4" aria-hidden />
              Guide des tailles
            </ButtonLink>
          </div>
        </div>
      </div>

      <ArrivageNewsletterCta source="catalogue-lancement" notifyHeading="Me prévenir" />

      <section aria-labelledby="catalogue-launch-rituals-title">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-retail-label text-tilouki-pistache mb-1">Déjà en ligne</p>
            <h3 id="catalogue-launch-rituals-title" className="text-section-title">
              Capsules shopping
            </h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Pyjamas, pluie, matin école — composez une tenue même avant le grand
              arrivage.
            </p>
          </div>
          <Link
            href="/"
            className="text-tilouki-pistache text-sm font-semibold underline-offset-4 hover:underline"
          >
            Retour à l&apos;accueil
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
