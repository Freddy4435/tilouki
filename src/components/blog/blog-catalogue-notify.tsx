import { Bell } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

export function BlogCatalogueNotify() {
  return (
    <section
      aria-labelledby="blog-catalogue-notify-title"
      className="bg-card space-y-3 rounded-[var(--radius-card)] border border-dashed border-tilouki-jade/35 p-5 shadow-[var(--shadow-soft)] sm:p-6"
      data-testid="blog-catalogue-notify"
    >
      <div className="flex items-start gap-3">
        <span className="bg-tilouki-jade-soft text-tilouki-teal-dark flex size-10 shrink-0 items-center justify-center rounded-full">
          <Bell className="size-5" aria-hidden />
        </span>
        <div className="space-y-2">
          <h2 id="blog-catalogue-notify-title" className="font-heading text-lg font-semibold">
            Prévenez-moi quand la sélection arrive
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Le catalogue Tilouki se prépare avec soin. Inscrivez-vous pour être informé dès
            les premières pièces en ligne — nouveautés du mercredi et conseils tailles, une
            fois par mois.
          </p>
          <ButtonLink href="#blog-newsletter" variant="outline" className="rounded-full">
            M&apos;inscrire à la newsletter
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
