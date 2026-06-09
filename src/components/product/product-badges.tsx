import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProductBadgeType =
  | "last-piece"
  | "low-price"
  | "cotton"
  | "spring-summer"
  | "autumn-winter"
  | "all-season";

const badgeConfig: Record<
  ProductBadgeType,
  { label: string; className: string }
> = {
  "last-piece": {
    label: "Dernière pièce",
    className: "bg-destructive/12 text-destructive border-destructive/20",
  },
  "low-price": {
    label: "Petit prix",
    className: "bg-tilouki-rose text-tilouki-ink border-tilouki-rose/50",
  },
  cotton: {
    label: "Coton",
    className: "bg-tilouki-sage-light text-tilouki-sage-dark border-tilouki-sage/30",
  },
  "spring-summer": {
    label: "Printemps/été",
    className: "bg-tilouki-blue-soft text-tilouki-ink border-tilouki-blue/40",
  },
  "autumn-winter": {
    label: "Automne/hiver",
    className: "bg-tilouki-beige text-tilouki-ink border-border",
  },
  "all-season": {
    label: "Toute saison",
    className: "bg-background text-muted-foreground border-border",
  },
};

interface ProductBadgeProps {
  type: ProductBadgeType;
  className?: string;
}

export function ProductBadge({ type, className }: ProductBadgeProps) {
  const config = badgeConfig[type];
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-full px-2.5 text-[0.7rem] font-semibold tracking-wide uppercase",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}

interface ProductBadgeListProps {
  badges: ProductBadgeType[];
  className?: string;
  max?: number;
}

export function ProductBadgeList({ badges, className, max = 3 }: ProductBadgeListProps) {
  const visible = badges.slice(0, max);
  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((badge) => (
        <ProductBadge key={badge} type={badge} />
      ))}
    </div>
  );
}
