"use client";

import { type LucideIcon } from "lucide-react";

import { useShop } from "@/components/providers/shop-provider";
import { buildTrustSectionItems } from "@/lib/legal/trust-content";
import { cn } from "@/lib/utils";

interface TrustSectionProps {
  variant?: "bar" | "grid";
  className?: string;
}

export function TrustSection({ variant = "grid", className }: TrustSectionProps) {
  const shop = useShop();
  const trustItems = buildTrustSectionItems(shop);

  if (trustItems.length === 0) return null;

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
    <section
      className={cn("bg-tilouki-beige/40 border-y", className)}
      aria-label="Réassurance"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="mb-8 text-center">
          <h2 className="text-section-title">Acheter en toute sérénité</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Une expérience simple et rassurante, pensée pour les parents pressés.
          </p>
        </div>
        <div
          className={cn(
            "grid gap-4",
            trustItems.length >= 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {trustItems.map((item) => (
            <TrustCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-soft)]">
      <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-[var(--radius-button)]">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
