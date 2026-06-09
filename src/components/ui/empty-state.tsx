import type { LucideIcon } from "lucide-react";

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
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-14 text-center shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-heading text-lg font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
      {action ? (
        <ButtonLink href={action.href} size="lg">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
