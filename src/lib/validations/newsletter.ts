import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse e-mail invalide.")
    .max(254, "Adresse e-mail trop longue."),
  consent: z.boolean().refine((value) => value === true, {
    message: "Vous devez accepter de recevoir la newsletter.",
  }),
  source: z.string().trim().max(64).optional().default("footer"),
  website: z.string().optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export const newsletterConfirmSchema = z.object({
  token: z.string().trim().min(16, "Lien de confirmation invalide."),
});
