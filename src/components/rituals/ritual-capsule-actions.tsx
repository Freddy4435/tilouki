import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  estimateRitualCapsuleTotalCents,
  getRitualCapsuleHref,
  RITUAL_CAPSULE_PRIMARY_CTA,
  RITUAL_CAPSULE_SIZES_CTA,
  shouldShowRitualCapsuleTotal,
} from "@/lib/rituals/ritual-capsule";
import type { Ritual } from "@/lib/rituals/rituals";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/types/catalog";

interface RitualCapsuleActionsProps {
  ritual: Ritual;
  products: ProductListItem[];
  /** Masquer sur la page détail (déjà sur la capsule). */
  showPrimaryCta?: boolean;
  className?: string;
}

export function RitualCapsuleActions({
  ritual,
  products,
  showPrimaryCta = true,
  className,
}: RitualCapsuleActionsProps) {
  if (products.length === 0) return null;

  const showTotal = shouldShowRitualCapsuleTotal(products);
  const totalCents = estimateRitualCapsuleTotalCents(products);

  return (
    <div className={cn("space-y-3", className)}>
      {showTotal ? (
        <p className="text-sm">
          Total estimé de la capsule{" "}
          <span className="text-tilouki-navy text-lg font-bold tabular-nums">
            {formatPrice(totalCents)}
          </span>
          <span className="text-muted-foreground ml-1 text-xs">
            (prix les plus bas par fiche)
          </span>
        </p>
      ) : null}

      <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap">
        {showPrimaryCta ? (
          <ButtonLink href={getRitualCapsuleHref(ritual.slug)} className="min-h-11">
            {RITUAL_CAPSULE_PRIMARY_CTA}
            <ArrowRight className="size-4" />
          </ButtonLink>
        ) : null}
        <ButtonLink
          href={ritual.catalogueHref}
          variant={showPrimaryCta ? "outline" : "default"}
          className="min-h-11"
        >
          {RITUAL_CAPSULE_SIZES_CTA}
          <ArrowRight className="size-4" />
        </ButtonLink>
      </div>
    </div>
  );
}
