import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProductBadgeType =
  | "new"
  | "last-piece"
  | "low-price"
  | "cotton"
  | "spring-summer"
  | "autumn-winter"
  | "all-season";

/** Badges autorisés sur les cartes catalogue (max 2, par priorité). */
export const STOREFRONT_CARD_BADGE_TYPES = [
  "new",
  "last-piece",
  "low-price",
  "cotton",
] as const satisfies readonly ProductBadgeType[];

export type StorefrontCardBadgeType = (typeof STOREFRONT_CARD_BADGE_TYPES)[number];

const badgeConfig: Record<ProductBadgeType, { label: string; className: string }> = {
  new: {
    label: "Nouveau",
    className: "bg-tilouki-teal-dark text-white border-transparent",
  },
  "last-piece": {
    label: "Dernière pièce",
    className: "bg-tilouki-persimmon-dark text-white border-transparent",
  },
  "low-price": {
    label: "Petit prix",
    className: "bg-tilouki-persimmon-dark text-white border-transparent",
  },
  cotton: {
    label: "Coton",
    className: "bg-tilouki-teal-dark/90 text-white border-transparent",
  },
  "spring-summer": {
    label: "Printemps-été",
    className: "bg-tilouki-powder-soft text-tilouki-plum border-tilouki-powder/60",
  },
  "autumn-winter": {
    label: "Automne-hiver",
    className: "bg-tilouki-beige text-tilouki-ink border-border",
  },
  "all-season": {
    label: "Toute saison",
    className: "bg-background text-muted-foreground border-border",
  },
};

export function filterStorefrontCardBadges(
  badges: ProductBadgeType[],
  max = 2,
): StorefrontCardBadgeType[] {
  const allowed = new Set<string>(STOREFRONT_CARD_BADGE_TYPES);
  const filtered = badges.filter((badge): badge is StorefrontCardBadgeType =>
    allowed.has(badge),
  );
  const sorted = [...filtered].sort(
    (left, right) =>
      STOREFRONT_CARD_BADGE_TYPES.indexOf(left) -
      STOREFRONT_CARD_BADGE_TYPES.indexOf(right),
  );
  return sorted.slice(0, max);
}

interface ProductBadgeProps {
  type: ProductBadgeType;
  className?: string;
  /** Variante compacte pour les cartes catalogue */
  size?: "default" | "card";
}

export function ProductBadge({ type, className, size = "default" }: ProductBadgeProps) {
  const config = badgeConfig[type];
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-semibold tracking-wide uppercase",
        size === "card"
          ? "h-[1.125rem] px-1.5 text-[0.6rem] leading-none"
          : "h-6 px-2.5 text-[0.7rem]",
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
  /** Filtre aux 4 badges retail carte + priorité */
  storefrontCard?: boolean;
  size?: "default" | "card";
}

export function ProductBadgeList({
  badges,
  className,
  max = 3,
  storefrontCard = false,
  size = "default",
}: ProductBadgeListProps) {
  const visible = storefrontCard
    ? filterStorefrontCardBadges(badges, max)
    : badges.slice(0, max);
  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visible.map((badge) => (
        <ProductBadge key={badge} type={badge} size={size} />
      ))}
    </div>
  );
}
