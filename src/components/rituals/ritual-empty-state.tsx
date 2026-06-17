import { ArrowRight, CalendarHeart, Package } from "lucide-react";

import { ArrivageNewsletterCta } from "@/components/newsletter/arrivage-newsletter-cta";
import { ButtonLink } from "@/components/ui/button-link";
import {
  buildNearbyCapsuleAlternatives,
  buildRitualEmptyAlternatives,
} from "@/lib/rituals/ritual-capsule";
import { cn } from "@/lib/utils";
import type { Ritual } from "@/lib/rituals/rituals";

interface RitualEmptyStateProps {
  ritual: Ritual;
  className?: string;
}

/** Arrivage en cours — capsules et rayons alternatifs, ton marchand. */
export function RitualEmptyState({ ritual, className }: RitualEmptyStateProps) {
  const rayons = buildRitualEmptyAlternatives(ritual);
  const nearbyCapsules = buildNearbyCapsuleAlternatives(ritual);

  return (
    <div
      className={cn(
        "border-tilouki-pistache/25 bg-tilouki-pistache-soft/35 space-y-4 rounded-[var(--radius-card)] border px-4 py-5 sm:px-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Package className="text-tilouki-pistache mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="space-y-1">
          <p className="text-retail-label text-tilouki-pistache inline-flex items-center gap-1.5">
            <CalendarHeart className="size-3.5" aria-hidden />
            Arrivage du mercredi
          </p>
          <p className="font-semibold">Cette capsule se remplit</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {ritual.emptyStateMessage} D&apos;autres rayons sont déjà en ligne.
          </p>
        </div>
      </div>

      {nearbyCapsules.length > 0 ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Voir les capsules proches
          </p>
          <div className="flex flex-wrap gap-2">
            {nearbyCapsules.map((cta) => (
              <ButtonLink
                key={cta.href}
                href={cta.href}
                variant="outline"
                size="sm"
                className="min-h-10"
              >
                {cta.label}
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {rayons.map((cta) => (
          <ButtonLink
            key={cta.href}
            href={cta.href}
            variant={cta.href === ritual.catalogueHref ? "default" : "outline"}
            size="sm"
            className="min-h-10"
          >
            {cta.label}
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        ))}
      </div>

      <ArrivageNewsletterCta
        source={`capsule-${ritual.slug}`}
        notifyHeading="Me prévenir"
        className="border-tilouki-pistache/20 bg-card/80"
      />
    </div>
  );
}
