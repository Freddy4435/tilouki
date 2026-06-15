import Link from "next/link";

import { RitualCard } from "@/components/rituals/ritual-card";
import { getAllRituals } from "@/lib/rituals/rituals";

export function HomeRitualsSection() {
  const rituals = getAllRituals();

  return (
    <section
      className="home-maison-section maison-surface maison-surface-milk scroll-mt-20 border-y border-border/50"
      aria-labelledby="home-rituals-title"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-retail-label text-tilouki-brand-blue mb-1.5">
              Idées shopping
            </p>
            <h2 id="home-rituals-title" className="text-section-title text-tilouki-navy">
              Par moment du quotidien
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              Matin pressé, nuit calme, jour de pluie… Trouvez les pièces adaptées à
              chaque situation.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="text-tilouki-navy text-sm font-semibold underline-offset-4 hover:underline"
          >
            Tout le catalogue
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {rituals.map((ritual) => (
            <li key={ritual.slug}>
              <RitualCard ritual={ritual} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
