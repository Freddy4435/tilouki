import { MapPin, Package, Truck } from "lucide-react";

interface ShippingHighlightsProps {
  shopName: string;
}

const HIGHLIGHTS = [
  {
    icon: Package,
    title: "Expédition depuis la France",
    iconClass: "bg-tilouki-denim-soft text-tilouki-navy",
    description: (shopName: string) =>
      `Chaque commande ${shopName} est préparée avec soin par une boutique indépendante en France. Chaque colis est vérifié avant l'envoi.`,
  },
  {
    icon: Truck,
    title: "Livraison en point relais",
    iconClass: "bg-tilouki-pistache-soft text-tilouki-navy",
    description: () =>
      "Choisissez le point relais le plus pratique pour vous. Une solution économique et flexible, idéale quand on ne peut pas être à la maison.",
    footnote: { icon: MapPin, label: "Mondial Relay — France métropolitaine" },
  },
] as const;

export function ShippingHighlights({ shopName }: ShippingHighlightsProps) {
  return (
    <section className="maison-surface maison-surface-icy border-tilouki-border/60 border-y">
      <div className="container-tilouki retail-flat-grid my-6 overflow-hidden rounded-[var(--radius-card)] sm:my-8 md:my-12 lg:my-16">
        <div className="grid md:grid-cols-2">
          {HIGHLIGHTS.map((item, index) => (
            <article
              key={item.title}
              className={`retail-flat-grid__cell flex gap-4 p-6 ${index === 0 ? "border-b md:border-r md:border-b-0" : ""}`}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] ${item.iconClass}`}
              >
                <item.icon className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold sm:text-lg">{item.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.description(shopName)}
                </p>
                {"footnote" in item && item.footnote ? (
                  <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
                    <item.footnote.icon className="size-3.5" aria-hidden />
                    {item.footnote.label}
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
