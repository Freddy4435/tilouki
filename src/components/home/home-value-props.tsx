import { HOME_VALUE_PROPS } from "@/lib/constants/reassurance";

export function HomeValueProps() {
  return (
    <section
      className="maison-surface maison-surface-beige border-y border-tilouki-sand/80"
      aria-labelledby="why-tilouki-title"
    >
      <div className="container-tilouki section-tilouki py-12 md:py-14">
        <div className="mb-8 text-center md:mb-10">
          <h2 id="why-tilouki-title" className="text-section-title">
            Pourquoi Tilouki
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
            Une boutique en ligne pensée pour les parents pressés : informations
            claires, stock honnête et livraison simple.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_VALUE_PROPS.map((item, index) => (
            <article
              key={item.id}
              className="group bg-card flex flex-col gap-4 rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-soft)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-card)]"
            >
              <div
                className="flex size-12 items-center justify-center rounded-[var(--radius-card)] transition-colors duration-[var(--transition-base)] group-hover:scale-[1.02]"
                style={{
                  background:
                    index % 4 === 0
                      ? "var(--tilouki-jade-soft)"
                      : index % 4 === 1
                        ? "var(--tilouki-icy)"
                        : index % 4 === 2
                          ? "var(--tilouki-butter-soft)"
                          : "color-mix(in srgb, var(--tilouki-teal), white 88%)",
                }}
              >
                <item.icon
                  className="size-5"
                  style={{
                    color:
                      index % 4 === 0 || index % 4 === 2
                        ? "var(--tilouki-teal-dark)"
                        : index % 4 === 1
                          ? "var(--tilouki-teal-dark)"
                          : "var(--tilouki-ink)",
                  }}
                  aria-hidden
                />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold sm:text-base">
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
