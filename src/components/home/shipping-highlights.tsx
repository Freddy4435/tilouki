import { MapPin, Package, Truck } from "lucide-react";

interface ShippingHighlightsProps {
  shopName: string;
}

export function ShippingHighlights({ shopName }: ShippingHighlightsProps) {
  return (
    <section className="maison-surface maison-surface-icy border-tilouki-icy/50 border-y">
      <div className="container-tilouki grid gap-4 py-6 sm:gap-6 sm:py-8 md:grid-cols-2 md:py-12 lg:py-16">
        <article className="surface-tactile flex gap-4 rounded-[var(--radius-card)] p-6">
          <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)]">
            <Package className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Expédition depuis la France</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {`Chaque commande ${shopName} est préparée avec soin par une boutique indépendante en France. Chaque colis est vérifié avant l'envoi.`}
            </p>
          </div>
        </article>

        <article className="surface-tactile flex gap-4 rounded-[var(--radius-card)] p-6">
          <div className="bg-tilouki-jade-soft text-tilouki-teal-dark flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)]">
            <Truck className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Livraison en point relais</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Choisissez le point relais le plus pratique pour vous. Une solution
              économique et flexible, idéale quand on ne peut pas être à la maison.
            </p>
            <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
              <MapPin className="size-3.5" />
              Mondial Relay — France métropolitaine
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
