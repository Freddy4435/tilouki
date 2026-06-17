import { cn } from "@/lib/utils";

interface SizeAgeBadgeProps {
  label: string;
  variant?: "size" | "age";
  selected?: boolean;
  density?: "default" | "compact";
  className?: string;
}

export function SizeAgeBadge({
  label,
  variant = "size",
  selected = false,
  density = "default",
  className,
}: SizeAgeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors",
        density === "compact"
          ? "h-6 min-w-6 rounded-md px-1.5 text-[10px]"
          : "h-7 min-w-7 rounded-full px-2.5 text-xs",
        variant === "size" &&
          !selected &&
          "border-border/80 bg-tilouki-cream text-foreground border",
        variant === "size" &&
          selected &&
          "border-primary bg-primary text-primary-foreground border",
        variant === "age" &&
          !selected &&
          "bg-tilouki-pistache-soft/85 text-tilouki-ink border-tilouki-pistache/35 border",
        variant === "age" &&
          selected &&
          "bg-tilouki-teal-dark border-tilouki-teal-dark border text-white",
        className,
      )}
    >
      {label}
    </span>
  );
}

interface SizeAgeBadgeListProps {
  items: string[];
  variant?: "size" | "age";
  className?: string;
  max?: number;
  density?: "default" | "compact";
  /** Une seule ligne — évite de casser la grille catalogue. */
  layout?: "wrap" | "inline";
}

export function SizeAgeBadgeList({
  items,
  variant = "size",
  className,
  max = 5,
  density = "default",
  layout = "wrap",
}: SizeAgeBadgeListProps) {
  const visible = items.slice(0, max);
  const remaining = items.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div
      className={cn(
        layout === "inline"
          ? "flex min-w-0 items-center gap-1 overflow-hidden"
          : "flex flex-wrap gap-1.5",
        className,
      )}
    >
      {visible.map((item) => (
        <SizeAgeBadge
          key={item}
          label={item}
          variant={variant}
          density={density}
          className={layout === "inline" ? "shrink-0" : undefined}
        />
      ))}
      {remaining > 0 ? (
        <span
          className={cn(
            "text-muted-foreground shrink-0 font-semibold tabular-nums",
            density === "compact" ? "text-[10px]" : "text-xs",
          )}
        >
          +{remaining}
        </span>
      ) : null}
    </div>
  );
}
