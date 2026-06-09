import { PackageOpen } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  children?: React.ReactNode;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  children,
  className,
  emptyTitle = "Aucun produit disponible",
  emptyDescription = "Le catalogue sera bientôt en ligne. Revenez très prochainement.",
}: ProductGridProps) {
  const hasChildren = Boolean(children);

  if (!hasChildren) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={emptyTitle}
        description={emptyDescription}
        action={{ label: "Retour à l'accueil", href: "/" }}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4", className)}
    >
      {children}
    </div>
  );
}
