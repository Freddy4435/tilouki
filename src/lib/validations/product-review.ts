import { z } from "zod";

export const productReviewFormSchema = z.object({
  productId: z.string().uuid("Produit invalide."),
  productSlug: z.string().min(1).max(120),
  authorName: z
    .string()
    .trim()
    .min(1, "Indiquez votre prénom.")
    .max(80, "Prénom trop long."),
  authorEmail: z.string().trim().email("Adresse e-mail invalide."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Choisissez une note entre 1 et 5.")
    .max(5, "Choisissez une note entre 1 et 5."),
  title: z.string().trim().min(2, "Titre trop court.").max(120, "Titre trop long."),
  body: z
    .string()
    .trim()
    .min(10, "Partagez un peu plus de détails (10 caractères minimum).")
    .max(2000, "Texte trop long."),
});

export type ProductReviewFormInput = z.infer<typeof productReviewFormSchema>;
