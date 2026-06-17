import Link from "next/link";
import { ArrowRight, Moon, Ruler, Sparkles, Sun } from "lucide-react";

import { buildCatalogueHref } from "@/lib/navigation/catalog-href";

const BUYING_HELP_LINKS = [
  {
    label: "Nouveautés du catalogue",
    href: buildCatalogueHref({ sort: "newest" }),
    description: "Derniers articles ajoutés — tailles visibles sur chaque fiche.",
    icon: Sparkles,
  },
  {
    label: "Capsule Nuit douce",
    href: "/rituels/nuit-calme",
    description: "Pyjamas et ensembles nuit — composer la capsule du soir.",
    icon: Moon,
  },
  {
    label: "Guide des tailles",
    href: "/guide-tailles",
    description: "Comparer les tailles et filtrer le catalogue par âge.",
    icon: Ruler,
  },
  {
    label: "Capsule Matin école",
    href: "/rituels/matin-presse",
    description: "Basiques prêts à enfiler — voir les pièces en stock.",
    icon: Sun,
  },
  {
    label: "Guide d'achat tailles enfant",
    href: "/blog/choisir-bonne-taille-vetement-enfant",
    description: "Repères concrets avant d'ajouter au panier.",
    icon: Ruler,
  },
  {
    label: "Bien choisir un pyjama enfant",
    href: "/blog/choisir-pyjama-enfant-nuit-confortable",
    description: "Matière, coupe et entretien pour la nuit.",
    icon: Moon,
  },
] as const;

export function HomeCarnetSection() {
  return (
    <section
      className="border-border/50 bg-tilouki-milk/80 border-t py-6 md:py-8"
      aria-labelledby="home-buying-help-title"
    >
      <div className="container-tilouki">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="home-buying-help-title"
              className="text-section-title text-tilouki-navy"
            >
              Guides d&apos;achat
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              En complément du catalogue — tailles, matières et sélections.
            </p>
          </div>
          <Link
            href={buildCatalogueHref({ sort: "newest" })}
            className="text-tilouki-navy inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
          >
            Retour au catalogue
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {BUYING_HELP_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group bg-card flex h-full items-center gap-3 rounded-[var(--radius-card)] border px-3.5 py-3 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <item.icon
                  className="text-tilouki-brand-blue size-4 shrink-0"
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="text-tilouki-navy block text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="text-muted-foreground line-clamp-1 text-xs">
                    {item.description}
                  </span>
                </span>
                <ArrowRight
                  className="text-tilouki-teal-dark size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
