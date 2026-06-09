import type { OrderStatus, PaymentStatus, ProductStatus } from "@/types/database";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Brouillon",
  active: "Actif",
  archived: "Archivé",
};

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function orderStatusVariant(status: OrderStatus): BadgeVariant {
  switch (status) {
    case "paid":
    case "preparing":
      return "default";
    case "shipped":
    case "delivered":
      return "secondary";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

export function paymentStatusVariant(status: PaymentStatus): BadgeVariant {
  switch (status) {
    case "paid":
      return "default";
    case "failed":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

export function productStatusVariant(status: ProductStatus): BadgeVariant {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "outline";
    case "archived":
      return "secondary";
  }
}
