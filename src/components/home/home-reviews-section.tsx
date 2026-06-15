import { MessageSquareHeart } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

interface HomeReviewsSectionProps {
  hasPublishedReviews: boolean;
}

export function HomeReviewsSection({ hasPublishedReviews }: HomeReviewsSectionProps) {
  return (
    <section
      className="container-tilouki py-10 md:py-12"
      aria-labelledby="home-reviews-title"
    >
      <div className="bg-card mx-auto max-w-2xl rounded-[var(--radius-card)] border px-6 py-8 text-center shadow-[var(--shadow-soft)]">
        <div className="bg-tilouki-jade-soft text-tilouki-teal-dark mx-auto flex size-12 items-center justify-center rounded-full">
          <MessageSquareHeart className="size-5" aria-hidden />
        </div>
        <h2 id="home-reviews-title" className="text-section-title mt-4">
          Avis clients
        </h2>

        {hasPublishedReviews ? (
          <>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Les avis vérifiés des parents sont publiés sur les fiches produit
              concernées. Aucune note inventée — uniquement des retours authentiques
              après achat.
            </p>
            <ButtonLink href="/catalogue" variant="outline" className="mt-5 min-h-11">
              Parcourir le catalogue
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Les premiers avis apparaîtront ici après les premières commandes livrées.
              En attendant, tailles, matières et stock sont détaillés sur chaque fiche
              produit.
            </p>
            <p className="text-muted-foreground mt-2 text-xs font-medium">
              Avis à venir
            </p>
          </>
        )}
      </div>
    </section>
  );
}
