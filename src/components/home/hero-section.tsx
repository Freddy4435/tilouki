import { ArrowRight, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

interface HeroSectionProps {
  shopName: string;
  tagline: string;
  description: string;
}

export function HeroSection({ shopName, tagline, description }: HeroSectionProps) {
  return (
    <section className="from-tilouki-rose-soft/80 via-tilouki-cream to-background relative overflow-hidden bg-gradient-to-br">
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-tilouki-blue-soft/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-tilouki-sage-light/50 blur-3xl" />

      <div className="container-tilouki section-tilouki relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-primary mb-4 inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="size-4" aria-hidden />
            {tagline}
          </p>
          <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Des vêtements enfants choisis avec soin
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
            {description}
          </p>
          <p className="text-foreground/80 mt-3 text-sm font-medium">
            Boutique française {shopName} — livraison en point relais pour les parents pressés.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/catalogue" size="lg" className="min-w-[14rem] rounded-full">
              Explorer le catalogue
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/catalogue?promo=petit-prix" variant="outline" size="lg" className="rounded-full">
              Voir les petits prix
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
