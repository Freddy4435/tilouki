import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import type { Ritual } from "@/lib/rituals/rituals";

interface RitualEmptyStateProps {
  ritual: Ritual;
  className?: string;
}

/** État vide rituel — renvoie vers des rayons précis, pas vers le blog. */
export function RitualEmptyState({ ritual, className }: RitualEmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-card space-y-4 rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] sm:p-6",
        className,
      )}
    >
      <p className="text-muted-foreground text-sm leading-relaxed">
        {ritual.emptyStateMessage}
      </p>
      <div className="flex flex-wrap gap-2">
        {ritual.emptyStateCtas.map((cta) => (
          <ButtonLink
            key={cta.href}
            href={cta.href}
            variant={cta.href === ritual.catalogueHref ? "default" : "outline"}
            className="min-h-10"
          >
            {cta.label}
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        ))}
      </div>
    </div>
  );
}
