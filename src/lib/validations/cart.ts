import { z } from "zod";

export const cartItemSchema = z.object({
  variantId: z.string().uuid("Identifiant variante invalide."),
  quantity: z.number().int().min(1).max(20, "Quantité maximale : 20 par article."),
});

export const cartValidateSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Le panier est vide.").max(50, "Panier trop volumineux."),
});

export type CartValidateInput = z.infer<typeof cartValidateSchema>;
