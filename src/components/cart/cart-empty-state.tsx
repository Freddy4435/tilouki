import { ShoppingBag } from "lucide-react";

import { CartRecommendations } from "@/components/cart/cart-recommendations";
import { CartRecommendationsClient } from "@/components/cart/cart-recommendations-client";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductListItem } from "@/types/catalog";

interface CartEmptyStateProps {
  recommendations?: ProductListItem[];
  compact?: boolean;
}

export function CartEmptyState({ recommendations, compact = false }: CartEmptyStateProps) {
  return (
    <div className="space-y-10">
      <EmptyState
        icon={ShoppingBag}
        title="Votre panier est vide"
        description="Découvrez nos vêtements enfants — tailles, âges et stock affichés sur chaque fiche. Livraison en point relais, paiement sécurisé."
        action={{ label: "Explorer le catalogue", href: "/catalogue" }}
        className={compact ? "py-8" : undefined}
      />

      {!compact ? (
        recommendations ? (
          <CartRecommendations products={recommendations} />
        ) : (
          <CartRecommendationsClient />
        )
      ) : null}
    </div>
  );
}
