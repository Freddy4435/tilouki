import Link from "next/link";
import { ArrowRight, CalendarHeart, Heart, Mail } from "lucide-react";

import { ARRIVAGE_NEWSLETTER_PROMISE } from "@/lib/newsletter/copy";

const RETURN_CARDS = [
  {
    id: "mercredi",
    icon: CalendarHeart,
    title: "Arrivage du mercredi",
    description:
      "Nouvelles pièces en stock chaque semaine — tailles affichées sur chaque fiche.",
    href: "#home-arrivage-mercredi",
    cta: "Voir l'arrivage",
  },
  {
    id: "favoris",
    icon: Heart,
    title: "Vos favoris",
    description:
      "Gardez les tailles repérées sous la main — stock et prix à jour sur cet appareil.",
    href: "/favoris",
    cta: "Ouvrir mes favoris",
  },
  {
    id: "newsletter",
    icon: Mail,
    title: "Alerte arrivage",
    description: ARRIVAGE_NEWSLETTER_PROMISE,
    href: "#newsletter",
    cta: "Recevoir l'arrivage",
  },
] as const;

export function HomeComeBackSection() {
  return (
    <section
      className="bg-tilouki-cloud/60 border-y py-10 md:py-12"
      aria-labelledby="home-come-back-title"
    >
      <div className="container-tilouki">
        <div className="mb-6 text-center md:mb-8">
          <p className="text-retail-label text-tilouki-pistache">On reste en lien</p>
          <h2 id="home-come-back-title" className="text-section-title mt-1">
            Trois raisons de revenir
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {RETURN_CARDS.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="bg-card group flex flex-col gap-3 rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <span className="bg-tilouki-pistache-soft text-tilouki-navy inline-flex size-11 items-center justify-center rounded-[var(--radius-button)]">
                <card.icon className="size-5" aria-hidden />
              </span>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-display text-base font-semibold sm:text-lg">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
              <span className="text-tilouki-pistache inline-flex items-center gap-1 text-sm font-semibold">
                {card.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
