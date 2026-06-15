import Image from "next/image";
import { ArrowRight, CreditCard, RotateCcw, Truck } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { getDefaultHeroEditorialImage, getEditorialImageOrNull } from "@/lib/media/editorial-images";

interface HeroSectionProps {
  shopName: string;
  /** Photo admin optionnelle — sinon visuel éditorial local. */
  heroImageUrl?: string | null;
}

const HERO_BASELINE =
  "Tee-shirts, bodies et pyjamas pour le quotidien — livrés en point relais.";

const REASSURANCE_ITEMS = [
  { icon: CreditCard, label: "Paiement sécurisé" },
  { icon: RotateCcw, label: "Retours 14 jours" },
  { icon: Truck, label: "Livraison point relais" },
] as const;

function editorialAltFromSrc(src: string, fallback: string): string {
  const id = src.replace(/^\/editorial\//, "").replace(/\.webp$/, "");
  return getEditorialImageOrNull(id)?.alt ?? fallback;
}

function resolveHeroImageSrc(heroImageUrl?: string | null): string {
  return heroImageUrl ?? getDefaultHeroEditorialImage().src;
}

export function HeroSection({ shopName, heroImageUrl }: HeroSectionProps) {
  const imageSrc = resolveHeroImageSrc(heroImageUrl);
  const imageAlt = heroImageUrl
    ? editorialAltFromSrc(heroImageUrl, `Ambiance ${shopName}`)
    : getDefaultHeroEditorialImage().alt;

  return (
    <section
      aria-labelledby="hero-heading"
      className="home-maison-hero border-border/60 border-b"
    >
      <div className="relative min-h-[var(--home-hero-min-height)] max-h-[min(82vh,680px)] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[center_42%]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tilouki-navy)_88%,transparent)] via-[color-mix(in_srgb,var(--tilouki-navy)_42%,transparent)] to-[color-mix(in_srgb,var(--tilouki-brand-blue)_18%,transparent)]"
          aria-hidden
        />
        <div className="container-tilouki relative z-10 flex min-h-[var(--home-hero-min-height)] max-h-[min(82vh,680px)] flex-col justify-end pb-6 pt-20 sm:pb-8 sm:pt-24 lg:pb-10">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <p className="text-retail-label text-tilouki-mint">Boutique vêtements enfants</p>
            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold tracking-tight text-white text-balance"
            >
              {shopName}
            </h1>
            <p className="max-w-md text-base font-medium leading-relaxed text-white/92 text-balance sm:text-lg">
              {HERO_BASELINE}
            </p>
            <div className="flex flex-col gap-2 pt-1 min-[400px]:flex-row min-[400px]:flex-wrap">
              <ButtonLink
                href="/catalogue"
                size="lg"
                className="min-h-11 flex-1 shadow-[var(--shadow-cta)] sm:flex-none"
              >
                Voir le catalogue
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href="#home-vestiaire"
                variant="outline"
                size="lg"
                className="min-h-11 flex-1 border-white/35 bg-white/12 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:flex-none"
              >
                Nouveautés du mercredi
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <div className="maison-surface-milk border-border/50 border-t">
        <ul className="container-tilouki text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-2 py-3 text-[11px] sm:justify-start sm:gap-x-5 sm:py-3.5 sm:text-xs">
          {REASSURANCE_ITEMS.map((item) => (
            <li key={item.label} className="inline-flex items-center gap-1.5">
              <item.icon className="text-tilouki-mint size-3.5 shrink-0" aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
