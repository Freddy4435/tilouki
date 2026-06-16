import { PackageOpen } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  children?: React.ReactNode;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href: string };
  /** Carrousel horizontal sur mobile (accueil retail). */
  layout?: "grid" | "scroll-mobile";
  /** Grille catalogue : colonnes plus denses, gaps réduits. */
  density?: "default" | "catalog";
}

export function ProductGrid({
  children,
  className,
  emptyTitle = "Aucun vêtement pour le moment",
  emptyDescription = "Notre sélection de vêtements enfants sera bientôt enrichie. Revenez très prochainement ou explorez les catégories.",
  emptyAction = { label: "Retour à l'accueil", href: "/" },
  layout = "grid",
  density = "default",
}: ProductGridProps) {
  const hasChildren = Boolean(children);

  if (!hasChildren) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  const gridClass =
    layout === "scroll-mobile"
      ? "product-scroll-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6"
      : density === "catalog"
        ? "grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-3.5 xl:grid-cols-5 xl:gap-3.5"
        : "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6";

  return (
    <div className={cn(gridClass, "min-w-0", className)} role="list">
      {children}
    </div>
  );
}
