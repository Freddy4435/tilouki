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
          "bg-tilouki-jade-soft/80 text-tilouki-ink border-tilouki-jade/40 border",
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
}

export function SizeAgeBadgeList({
  items,
  variant = "size",
  className,
  max = 5,
  density = "default",
}: SizeAgeBadgeListProps) {
  const visible = items.slice(0, max);
  const remaining = items.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((item) => (
        <SizeAgeBadge key={item} label={item} variant={variant} density={density} />
      ))}
      {remaining > 0 ? (
        <SizeAgeBadge
          label={`+${remaining}`}
          variant={variant}
          density={density}
          className="text-muted-foreground border-dashed opacity-80"
        />
      ) : null}
    </div>
  );
}
