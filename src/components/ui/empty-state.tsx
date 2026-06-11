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
        "bg-card flex flex-col items-center gap-5 rounded-2xl border border-dashed px-6 py-14 text-center shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="from-tilouki-rose-soft to-tilouki-blue-soft flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br">
        <Icon className="text-primary size-7" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <p className="font-heading text-xl font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
      {action ? (
        <ButtonLink href={action.href} size="lg" className="rounded-full">
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
