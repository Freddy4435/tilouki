import { FileUp, Package, Plus, Settings } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

export function AdminDashboardCta() {
  return (
    <div className="flex flex-wrap gap-2">
      <ButtonLink href="/admin/produits/nouveau" size="sm">
        <Plus className="size-4" />
        Ajouter un produit
      </ButtonLink>
      <ButtonLink href="/admin/import" variant="outline" size="sm">
        <FileUp className="size-4" />
        Importer CSV
      </ButtonLink>
      <ButtonLink href="/admin/commandes?status=paid" variant="outline" size="sm">
        <Package className="size-4" />
        Commandes à préparer
      </ButtonLink>
      <ButtonLink href="/admin/parametres" variant="outline" size="sm">
        <Settings className="size-4" />
        Paramètres boutique
      </ButtonLink>
    </div>
  );
}
