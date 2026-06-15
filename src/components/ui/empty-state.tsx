import type { LucideIcon } from "lucide-react";

import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  showReassurance?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  showReassurance = true,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col items-center gap-5 rounded-[var(--radius-card)] border border-dashed px-6 py-14 text-center shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="bg-tilouki-jade-soft flex size-16 items-center justify-center rounded-[var(--radius-card)]">
        <Icon className="text-tilouki-teal-dark size-7" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <p className="text-section-title">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
      {action ? (
        <ButtonLink href={action.href} size="lg">
          {action.label}
        </ButtonLink>
      ) : null}
      {showReassurance ? (
        <div className="border-border/60 w-full max-w-lg border-t pt-5">
          <ReassuranceStrip variant="compact" />
        </div>
      ) : null}
    </div>
  );
}
