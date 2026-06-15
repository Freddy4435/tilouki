import Link from "next/link";
import { ArrowRight, CalendarHeart, Heart, Mail } from "lucide-react";

const RETURN_CARDS = [
  {
    id: "mercredi",
    icon: CalendarHeart,
    title: "Chaque mercredi",
    description:
      "De nouvelles pièces peuvent arriver en boutique — passez voir les nouveautés du mercredi.",
    href: "#home-nouveautes",
    cta: "Voir les nouveautés",
  },
  {
    id: "favoris",
    icon: Heart,
    title: "Vos coups de cœur",
    description:
      "Enregistrez les tailles repérées et retrouvez-les quand vous êtes prêts à commander.",
    href: "/favoris",
    cta: "Ouvrir mes favoris",
  },
  {
    id: "newsletter",
    icon: Mail,
    title: "Le mot de Tilouki",
    description:
      "Les nouveautés du mercredi, les petits prix et les conseils tailles — une fois par mois.",
    href: "#newsletter",
    cta: "S'inscrire à la newsletter",
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
          <p className="text-retail-label text-tilouki-teal-dark">On reste en lien</p>
          <h2 id="home-come-back-title" className="text-section-title mt-1">
            Trois bonnes raisons de revenir
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {RETURN_CARDS.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="bg-card group flex flex-col gap-3 rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <span className="bg-tilouki-jade-soft text-tilouki-teal-dark inline-flex size-11 items-center justify-center rounded-[var(--radius-button)]">
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
              <span className="text-primary inline-flex items-center gap-1 text-sm font-semibold">
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
