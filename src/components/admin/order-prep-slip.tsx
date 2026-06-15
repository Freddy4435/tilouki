import { Printer } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

interface OrderPrepSlipProps {
  orderId: string;
  orderNumber: string;
}

export function OrderPrepSlip({ orderId, orderNumber }: OrderPrepSlipProps) {
  return (
    <ButtonLink
      href={`/admin/commandes/${orderId}/preparation/print`}
      variant="outline"
      size="sm"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Imprimer le bon de préparation ${orderNumber}`}
    >
      <Printer className="size-4" />
      Imprimer bon de préparation
    </ButtonLink>
  );
}
