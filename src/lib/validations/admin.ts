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

export const companyLookupQuerySchema = z.object({
  siret: z
    .string()
    .trim()
    .min(1, "SIRET requis.")
    .max(20)
    .refine((value) => /^\d{14}$/.test(value.replace(/\D/g, "")), {
      message: "SIRET invalide (14 chiffres).",
    }),
});

export type AdminOrdersExportQuery = z.infer<typeof adminOrdersExportQuerySchema>;
export type CompanyLookupQuery = z.infer<typeof companyLookupQuerySchema>;
