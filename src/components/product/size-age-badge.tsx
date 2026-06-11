import { cn } from "@/lib/utils";

interface SizeAgeBadgeProps {
  label: string;
  variant?: "size" | "age";
  selected?: boolean;
  className?: string;
}

export function SizeAgeBadge({
  label,
  variant = "size",
  selected = false,
  className,
}: SizeAgeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2.5 text-xs font-semibold transition-colors",
        variant === "size" &&
          !selected &&
          "border-border/80 bg-tilouki-cream text-foreground border",
        variant === "size" &&
          selected &&
          "border-primary bg-primary text-primary-foreground border",
        variant === "age" &&
          !selected &&
          "bg-tilouki-blue-soft/80 text-tilouki-ink border border-tilouki-blue/20",
        variant === "age" &&
          selected &&
          "bg-tilouki-blue text-white border border-tilouki-blue",
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
}

export function SizeAgeBadgeList({
  items,
  variant = "size",
  className,
  max = 5,
}: SizeAgeBadgeListProps) {
  const visible = items.slice(0, max);
  const remaining = items.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((item) => (
        <SizeAgeBadge key={item} label={item} variant={variant} />
      ))}
      {remaining > 0 ? (
        <SizeAgeBadge
          label={`+${remaining}`}
          variant={variant}
          className="text-muted-foreground border-dashed opacity-80"
        />
      ) : null}
    </div>
  );
}
