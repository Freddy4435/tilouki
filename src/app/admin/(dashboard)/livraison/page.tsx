import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ShippingRatesManager } from "@/components/admin/shipping-rates-manager";
import { getAvailableCarriers } from "@/lib/shipping/carriers";
import { listAdminShippingRates } from "@/lib/supabase/queries/admin/shipping-rates";

export const metadata: Metadata = {
  title: "Livraison",
  robots: { index: false, follow: false },
};

export default async function AdminShippingPage() {
  const rates = await listAdminShippingRates();
  const carriers = getAvailableCarriers();

  return (
    <>
      <AdminPageHeader
        title="Livraison"
        description="Barème des frais de port par transporteur (tranches de poids)."
      />
      <ShippingRatesManager
        rates={rates}
        configuredCarriers={carriers.map((carrier) => carrier.id)}
      />
    </>
  );
}
