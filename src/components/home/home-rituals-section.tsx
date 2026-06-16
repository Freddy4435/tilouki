import Link from "next/link";

import {
  ShoppableRitualModule,
  type ShoppableRitualLayout,
} from "@/components/home/shoppable-ritual-module";
import type { Ritual } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

const RITUAL_LAYOUTS: ShoppableRitualLayout[] = ["stack", "split", "banner"];

export interface HomeRitualModule {
  ritual: Ritual;
  products: ProductListItem[];
}

interface HomeRitualsSectionProps {
  modules: HomeRitualModule[];
}

export function HomeRitualsSection({ modules }: HomeRitualsSectionProps) {
  return (
    <section
      className="retail-section home-maison-section maison-surface maison-surface-milk border-tilouki-border/80 scroll-mt-20 border-y"
      aria-labelledby="home-rituals-title"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <header className="retail-section__header max-w-2xl">
            <div className="brand-accent-bar" aria-hidden />
            <p className="text-retail-label text-tilouki-brand-blue">
              Besoins du quotidien
            </p>
            <h2
              id="home-rituals-title"
              className="text-section-title retail-section__title"
            >
              Shopper par moment
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Pyjamas, pluie, bébé, école ou petits prix — pièces en stock avec tailles
              sur chaque fiche.
            </p>
          </header>
          <Link
            href="/catalogue"
            className="text-tilouki-navy text-sm font-semibold underline-offset-4 hover:underline"
          >
            Tout le catalogue
          </Link>
        </div>

        <ul className="space-y-5 md:space-y-6">
          {modules.map(({ ritual, products }, index) => (
            <li key={ritual.slug}>
              <ShoppableRitualModule
                ritual={ritual}
                products={products}
                layout={RITUAL_LAYOUTS[index % RITUAL_LAYOUTS.length]!}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
