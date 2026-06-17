import { HOME_VALUE_PROPS } from "@/lib/constants/reassurance";

const ICON_BACKGROUNDS = [
  "bg-tilouki-pistache-soft text-tilouki-navy",
  "bg-tilouki-denim-soft text-tilouki-navy",
  "bg-tilouki-rose-linge-soft text-tilouki-navy",
  "bg-tilouki-vanille-soft text-tilouki-navy",
] as const;

export function HomeValueProps() {
  return (
    <section
      className="maison-surface maison-surface-pistache border-tilouki-border/80 border-y"
      aria-labelledby="why-tilouki-title"
    >
      <div className="container-tilouki section-tilouki py-12 md:py-14">
        <div className="mb-8 text-center md:mb-10">
          <div className="brand-accent-bar mx-auto md:mx-0" aria-hidden />
          <h2 id="why-tilouki-title" className="text-section-title mt-3">
            Pourquoi Tilouki
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
            Une boutique en ligne pensée pour les parents pressés : informations
            claires, stock honnête et livraison simple.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-[var(--tilouki-border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
          {HOME_VALUE_PROPS.map((item, index) => (
            <article key={item.id} className="bg-tilouki-milk flex flex-col gap-3 p-5">
              <div
                className={`flex size-11 items-center justify-center rounded-[var(--radius-button)] ${ICON_BACKGROUNDS[index % ICON_BACKGROUNDS.length]}`}
              >
                <item.icon className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold sm:text-base">
                  {item.label}
                </h3>
                {item.description ? (
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
