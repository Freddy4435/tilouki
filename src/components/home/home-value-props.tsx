import { HOME_VALUE_PROPS } from "@/lib/constants/reassurance";

export function HomeValueProps() {
  return (
    <section className="bg-tilouki-beige/40 border-y" aria-label="Nos engagements">
      <div className="container-tilouki section-tilouki py-12 md:py-14">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Une boutique pensée pour les parents
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
            Simplicité, transparence et sérénité — de la sélection des vêtements à la réception du
            colis.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_VALUE_PROPS.map((item, index) => (
            <article
              key={item.id}
              className="bg-card group flex flex-col gap-4 rounded-2xl p-5 shadow-[var(--shadow-soft)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-card)]"
            >
              <div
                className="flex size-12 items-center justify-center rounded-2xl transition-colors duration-[var(--transition-base)] group-hover:scale-[1.02]"
                style={{
                  background:
                    index % 4 === 0
                      ? "color-mix(in oklch, var(--shop-primary), white 88%)"
                      : index % 4 === 1
                        ? "var(--tilouki-blue-soft)"
                        : index % 4 === 2
                          ? "var(--tilouki-sage-light)"
                          : "var(--tilouki-rose-soft)",
                }}
              >
                <item.icon
                  className="size-5"
                  style={{
                    color:
                      index % 4 === 2
                        ? "var(--tilouki-sage-dark)"
                        : "var(--tilouki-ink)",
                  }}
                  aria-hidden
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold sm:text-base">{item.label}</h3>
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
