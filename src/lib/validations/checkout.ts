import { z } from "zod";

export const checkoutCustomerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis.").max(100),
  lastName: z.string().min(1, "Le nom est requis.").max(100),
  email: z.string().email("Adresse e-mail invalide."),
  phone: z
    .string()
    .min(10, "Le téléphone est requis pour la livraison.")
    .max(20, "Numéro trop long.")
    .regex(/^[+0-9\s.-]+$/, "Format de téléphone invalide."),
});

export const relayPointSchema = z.object({
  id: z.string().min(1, "Sélectionnez un point relais."),
  name: z.string().min(1),
  address: z.string().min(1),
  zip: z.string().min(4, "Code postal invalide."),
  city: z.string().min(1),
  country: z.string().length(2, "Pays invalide."),
});

export const checkoutFormSchema = checkoutCustomerSchema.extend({
  relayPoint: relayPointSchema,
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "Vous devez accepter les conditions générales de vente.",
  }),
});

export const checkoutSessionSchema = z
  .object({
    customer: checkoutCustomerSchema,
    relayPoint: relayPointSchema,
    items: z
      .array(
        z.object({
          variantId: z.string().uuid(),
          quantity: z.number().int().min(1).max(20, "Quantité maximale : 20 par article."),
        }),
      )
      .min(1, "Le panier est vide."),
  })
  .strict();

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type RelayPointInput = z.infer<typeof relayPointSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
