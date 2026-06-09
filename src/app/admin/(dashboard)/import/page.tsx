import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductImportFlow } from "@/components/admin/product-import-flow";

export const metadata: Metadata = {
  title: "Import CSV produits",
  robots: { index: false, follow: false },
};

export default function AdminImportPage() {
  return (
    <>
      <AdminPageHeader
        title="Import CSV"
        description="Créez rapidement des produits et variantes depuis un fichier CSV."
      />
      <ProductImportFlow />
    </>
  );
}
