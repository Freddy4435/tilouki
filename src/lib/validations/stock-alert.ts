import { z } from "zod";

export const stockAlertSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse e-mail invalide.")
    .max(254, "Adresse e-mail trop longue."),
  consent: z.boolean().refine((value) => value === true, {
    message: "Vous devez accepter de recevoir l'alerte stock.",
  }),
  productId: z.string().uuid("Produit invalide."),
  variantId: z.string().uuid("Taille invalide."),
  productSlug: z.string().trim().min(1).max(120),
  sizeLabel: z.string().trim().max(64).optional().nullable(),
  website: z.string().optional(),
});

export type StockAlertSubscribeInput = z.infer<typeof stockAlertSubscribeSchema>;
