import { BookOpen } from "lucide-react";

import { EditorialImage } from "@/components/media/editorial-image";

export function BlogHero() {
  return (
    <header className="maison-surface maison-surface-plum border-b border-tilouki-plum/15">
      <div className="container-tilouki section-tilouki pb-10 pt-8 md:pb-14 md:pt-12">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-carnet-label inline-flex items-center justify-center gap-2 lg:justify-start">
              <BookOpen className="size-4" aria-hidden />
              Le Carnet Tilouki
            </p>
            <h1 className="font-heading text-section-title-plum text-3xl font-semibold tracking-tight sm:text-4xl">
              Conseils pour la garde-robe enfant
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base lg:mx-0">
              Tailles, matières, entretien et petits rituels du quotidien — des articles
              pratiques pour choisir avec sérénité, sans promesses excessives.
            </p>
          </div>
          <EditorialImage
            imageId="blog-default"
            fill
            sizes="(max-width: 1024px) 100vw, 36vw"
            className="mx-auto aspect-[16/10] w-full max-w-lg rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 ring-tilouki-plum/10 lg:max-w-none"
          />
        </div>
      </div>
    </header>
  );
}
