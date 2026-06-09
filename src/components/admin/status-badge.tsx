import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PRODUCT_STATUS_LABELS,
  orderStatusVariant,
  paymentStatusVariant,
  productStatusVariant,
} from "@/lib/admin/status-labels";
import type { OrderStatus, PaymentStatus, ProductStatus } from "@/types/database";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={orderStatusVariant(status)}>{ORDER_STATUS_LABELS[status] ?? status}</Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={paymentStatusVariant(status)}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant={productStatusVariant(status)}>
      {PRODUCT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
