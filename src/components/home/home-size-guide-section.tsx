import { ArrowRight, Ruler } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

const SIZE_TIPS = [
  {
    range: "3M – 9M",
    label: "Bébé",
    tip: "Préférez une coupe légèrement ample pour les couches et le confort à l'allaitement.",
  },
  {
    range: "12M – 24M",
    label: "Tout-petit",
    tip: "Entre deux tailles ? Montez d'un cran : les enfants grandissent vite à cet âge.",
  },
  {
    range: "2A – 6A",
    label: "Enfant",
    tip: "Vérifiez l'âge indiqué sur la fiche produit — chaque marque taille un peu différemment.",
  },
] as const;

export function HomeSizeGuideSection() {
  return (
    <section
      id="home-guide-tailles"
      className="border-tilouki-sage/10 from-tilouki-sage-light/20 to-background scroll-mt-20 border-y bg-gradient-to-b py-10 md:py-12"
      aria-labelledby="home-size-guide-title"
    >
      <div className="container-tilouki">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="text-retail-label text-tilouki-sage-dark mb-2 inline-flex items-center gap-1.5">
              <Ruler className="size-3.5" aria-hidden />
              Aide au choix
            </p>
            <h2 id="home-size-guide-title" className="text-section-title">
              Guide des tailles
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed sm:text-base">
              Chaque fiche affiche la taille ou l&apos;âge disponible. En cas de doute,
              prenez la taille au-dessus : mieux vaut un peu de marge pour jouer et
              grandir sereinement.
            </p>
            <ButtonLink href="/catalogue" variant="outline" className="mt-5 min-h-11">
              Voir les tailles en stock
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {SIZE_TIPS.map((item) => (
              <li
                key={item.range}
                className="bg-card rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft)]"
              >
                <p className="text-retail-label text-tilouki-teal-dark">{item.label}</p>
                <p className="mt-1 font-semibold tabular-nums">{item.range}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.tip}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs leading-relaxed">
          Une question sur la taille ? Les détails sont sur chaque fiche produit, avec
          le stock par âge ou pointure.
        </p>
      </div>
    </section>
  );
}
