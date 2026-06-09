import { z } from "zod";

const orderStatuses = [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;

export const adminOrdersExportQuerySchema = z.object({
  status: z.enum(orderStatuses).optional(),
  payment: z.enum(paymentStatuses).optional(),
  q: z.string().max(100).optional(),
});

export type AdminOrdersExportQuery = z.infer<typeof adminOrdersExportQuerySchema>;
