import { MapPin, Package, Truck } from "lucide-react";

interface ShippingHighlightsProps {
  shopName: string;
}

export function ShippingHighlights({ shopName }: ShippingHighlightsProps) {
  return (
    <section className="bg-tilouki-beige/50 border-y">
      <div className="container-tilouki grid gap-6 py-12 md:grid-cols-2 md:py-16">
        <article className="bg-card flex gap-4 rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
            <Package className="size-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Expédition depuis mon stock en France
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Chaque commande {shopName} est préparée avec soin depuis mon stock personnel en
              France. Vous achetez directement auprès d&apos;une vendeuse indépendante, avec une
              préparation attentive de chaque colis.
            </p>
          </div>
        </article>

        <article className="bg-card flex gap-4 rounded-2xl p-6 shadow-[var(--shadow-soft)]">
          <div className="bg-tilouki-blue-soft text-tilouki-ink flex size-12 shrink-0 items-center justify-center rounded-xl">
            <Truck className="size-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Livraison en point relais</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Choisissez le point relais le plus pratique pour vous. Une solution économique et
              flexible, idéale quand on ne peut pas être à la maison.
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
