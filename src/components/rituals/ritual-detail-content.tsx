import { CatalogueProductList } from "@/components/catalogue/catalogue-product-list";
import { RitualCapsuleActions } from "@/components/rituals/ritual-capsule-actions";
import { RitualEmptyState } from "@/components/rituals/ritual-empty-state";
import type { Ritual } from "@/lib/rituals/rituals";
import type { ProductListItem } from "@/types/catalog";

interface RitualDetailContentProps {
  ritual: Ritual;
  products: ProductListItem[];
}

export function RitualDetailContent({ ritual, products }: RitualDetailContentProps) {
  const hasProducts = products.length > 0;

  return (
    <div className="space-y-6">
      {hasProducts ? (
        <>
          <CatalogueProductList products={products} layout="grid" priorityLimit={4} />
          <p className="text-muted-foreground text-sm">{ritual.shoppingTip}</p>
          <RitualCapsuleActions
            ritual={ritual}
            products={products}
            showPrimaryCta={false}
          />
        </>
      ) : (
        <RitualEmptyState ritual={ritual} />
      )}
    </div>
  );
}
