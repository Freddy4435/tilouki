import Image from "next/image";
import { ArrowRight, CreditCard, RotateCcw, Truck } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { IMAGE_SIZES } from "@/lib/media/image-sizes";
import { resolveEditorialAltFromSrc } from "@/lib/media/editorial-images";
import {
  isTiloukiPackImageUrl,
  resolveEditorialModuleTiloukiImage,
} from "@/lib/tilouki-images";

interface HeroSectionProps {
  shopName: string;
  /** Photo admin optionnelle — sinon visuel pack Tilouki. */
  heroImageUrl?: string | null;
}

const HERO_BASELINE =
  "Vêtements enfants en stock — tailles visibles, livraison en point relais.";

const REASSURANCE_ITEMS = [
  { icon: CreditCard, label: "Paiement sécurisé" },
  { icon: RotateCcw, label: "Retours 14 jours" },
  { icon: Truck, label: "Livraison point relais" },
] as const;

export function resolveHeroImage(heroImageUrl?: string | null) {
  if (heroImageUrl?.trim()) {
    return {
      src: heroImageUrl,
      alt: resolveEditorialAltFromSrc(heroImageUrl, "Vêtements enfants Tilouki"),
    };
  }
  const pack = resolveEditorialModuleTiloukiImage("hero-home");
  return { src: pack.src, alt: pack.alt };
}

export function HeroSection({ shopName, heroImageUrl }: HeroSectionProps) {
  const heroImage = resolveHeroImage(heroImageUrl);
  const usePackImage = isTiloukiPackImageUrl(heroImage.src) || !heroImageUrl;

  return (
    <section
      aria-labelledby="hero-heading"
      className="home-maison-hero border-tilouki-border/60 border-b"
    >
      <div className="relative max-h-[min(82vh,680px)] min-h-[var(--home-hero-min-height)] overflow-hidden">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          fetchPriority="high"
          sizes={IMAGE_SIZES.hero}
          quality={72}
          className="object-cover object-[center_42%]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tilouki-navy-dark)_90%,transparent)] via-[color-mix(in_srgb,var(--tilouki-navy)_45%,transparent)] to-transparent"
          aria-hidden
        />
        <div className="container-tilouki relative z-10 flex max-h-[min(82vh,680px)] min-h-[var(--home-hero-min-height)] flex-col justify-end pt-20 pb-6 sm:pt-24 sm:pb-8 lg:pb-10">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <p className="text-retail-label text-tilouki-vanille">
              {usePackImage ? "Boutique vêtements enfants" : shopName}
            </p>
            <h1 id="hero-heading" className="text-editorial-title text-white">
              {shopName}
            </h1>
            <p className="max-w-md text-base leading-relaxed font-medium text-balance text-white/92 sm:text-lg">
              {HERO_BASELINE}
            </p>
            <div className="flex flex-col gap-2 pt-1 min-[400px]:flex-row min-[400px]:flex-wrap">
              <ButtonLink
                href="#home-vestiaire"
                size="lg"
                className="min-h-11 flex-1 shadow-[var(--shadow-cta)] sm:flex-none"
              >
                Composer une tenue
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href="#home-rayons"
                variant="outline"
                size="lg"
                className="min-h-11 flex-1 border-white/35 bg-white/12 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:flex-none"
              >
                Choisir par âge
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <div className="maison-surface-milk border-tilouki-border/50 border-t">
        <ul className="container-tilouki text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-2 py-3 text-[11px] sm:justify-start sm:gap-x-5 sm:py-3.5 sm:text-xs">
          {REASSURANCE_ITEMS.map((item) => (
            <li key={item.label} className="inline-flex items-center gap-1.5">
              <item.icon
                className="text-tilouki-pistache size-3.5 shrink-0"
                aria-hidden
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
