import { BookOpen } from "lucide-react";

import { EditorialImage } from "@/components/media/editorial-image";
import { buyingGuidesNav } from "@/lib/constants/site";

export function BlogHero() {
  return (
    <header className="maison-surface maison-surface-plum border-tilouki-plum/15 border-b">
      <div className="container-tilouki section-tilouki pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-carnet-label inline-flex items-center justify-center gap-2 lg:justify-start">
              <BookOpen className="size-4" aria-hidden />
              {buyingGuidesNav.label} Tilouki
            </p>
            <h1 className="font-heading text-section-title-plum text-3xl font-semibold tracking-tight sm:text-4xl">
              Choisir les bonnes pièces pour votre enfant
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base lg:mx-0">
              Tailles, matières, entretien et sélections catalogue — des guides courts
              pour passer du conseil à l&apos;achat.
            </p>
          </div>
          <EditorialImage
            imageId="blog-default"
            fill
            sizes="(max-width: 1024px) 100vw, 36vw"
            className="ring-tilouki-plum/10 mx-auto aspect-[16/10] w-full max-w-lg rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 lg:max-w-none"
          />
        </div>
      </div>
    </header>
  );
}
