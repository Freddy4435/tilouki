import { z } from "zod";

import { MAX_FAVORITES } from "@/lib/favorites/store";

export const customerMagicLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-mail requis.")
    .email("Adresse e-mail invalide."),
});

export const customerFavoritesSyncSchema = z.object({
  slugs: z
    .array(z.string().trim().min(1).max(120))
    .max(MAX_FAVORITES, `Maximum ${MAX_FAVORITES} favoris.`),
});
