import { z } from "zod";

import type { OrderStatus } from "@/types/database";

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const updateOrderTrackingSchema = z.object({
  orderId: z.string().uuid(),
  trackingNumber: z
    .string()
    .trim()
    .min(4, "Numéro de suivi trop court.")
    .max(100, "Numéro de suivi trop long."),
});

export const updateOrderInternalNotesSchema = z.object({
  orderId: z.string().uuid(),
  internalNotes: z.string().max(5000).optional().nullable(),
});

export const createShippingLabelSchema = z.object({
  orderId: z.string().uuid(),
});

export const registerExternalShipmentSchema = z.object({
  orderId: z.string().uuid(),
  trackingNumber: z
    .string()
    .trim()
    .min(4, "Numéro de suivi trop court.")
    .max(100, "Numéro de suivi trop long."),
  carrierShipmentNumber: z.string().trim().max(100).optional().nullable(),
  labelUrl: z.string().trim().max(2000).optional().nullable(),
  markShipped: z.boolean().default(true),
});

export const orderStatusActionSchema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(["mark_preparing", "mark_shipped", "mark_delivered", "cancel"]),
  trackingNumber: z.string().trim().max(100).optional().nullable(),
});

export const adminOrderRefundSchema = z
  .object({
    orderId: z.string().uuid(),
    mode: z.enum(["full", "partial"]),
    amountCents: z.number().int().positive().optional(),
    reason: z
      .enum(["requested_by_customer", "duplicate", "fraudulent"])
      .default("requested_by_customer"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "partial" && data.amountCents == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Montant requis pour un remboursement partiel.",
        path: ["amountCents"],
      });
    }
  });

export const adminStockAdjustSchema = z.object({
  variantId: z.string().uuid(),
  delta: z
    .number()
    .int()
    .refine((value) => value !== 0, "La variation doit être différente de zéro."),
  note: z
    .string()
    .trim()
    .min(3, "Précisez la raison de l'ajustement (3 caractères min.).")
    .max(500),
});

export type OrderAdminAction = z.infer<typeof orderStatusActionSchema>["action"];

export function actionToStatus(action: OrderAdminAction): OrderStatus {
  switch (action) {
    case "mark_preparing":
      return "preparing";
    case "mark_shipped":
      return "shipped";
    case "mark_delivered":
      return "delivered";
    case "cancel":
      return "cancelled";
  }
}
