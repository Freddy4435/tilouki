import {
  CreditCard,
  PackageCheck,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface TrustItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const trustItems: TrustItem[] = [
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    description: "Règlement protégé via Stripe. Aucune carte bancaire stockée.",
  },
  {
    icon: Truck,
    title: "Livraison point relais",
    description: "Retrait près de chez vous avec Mondial Relay, frais maîtrisés.",
  },
  {
    icon: RotateCcw,
    title: "Retour sous 14 jours",
    description: "Changez d'avis ? Retour simple selon nos conditions.",
  },
  {
    icon: PackageCheck,
    title: "Stock réel",
    description: "Disponibilité affichée par taille, mise à jour en temps réel.",
  },
];

interface TrustSectionProps {
  variant?: "bar" | "grid";
  className?: string;
}

export function TrustSection({ variant = "grid", className }: TrustSectionProps) {
  if (variant === "bar") {
    return (
      <div
        className={cn(
          "bg-tilouki-sage-light/50 text-tilouki-sage-dark border-tilouki-sage/20 border-b py-2.5 text-xs",
          className,
        )}
      >
        <div className="container-tilouki">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            {trustItems.map((item) => (
              <li key={item.title} className="flex items-center gap-1.5 font-medium">
                <item.icon className="size-3.5 shrink-0" aria-hidden />
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <section className={cn("bg-tilouki-beige/40 border-y", className)} aria-label="Réassurance">
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-semibold">Acheter en toute sérénité</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Une expérience simple et rassurante, pensée pour les parents pressés.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="bg-card flex flex-col gap-3 rounded-2xl p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                <item.icon className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
