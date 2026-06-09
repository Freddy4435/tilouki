import { cn } from "@/lib/utils";

interface SizeAgeBadgeProps {
  label: string;
  variant?: "size" | "age";
  className?: string;
}

export function SizeAgeBadge({ label, variant = "size", className }: SizeAgeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-medium",
        variant === "size" &&
          "border-border bg-background text-foreground hover:border-primary/40",
        variant === "age" &&
          "border-tilouki-blue/30 bg-tilouki-blue-soft text-tilouki-ink",
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
        <SizeAgeBadge label={`+${remaining}`} variant={variant} className="text-muted-foreground" />
      ) : null}
    </div>
  );
}
