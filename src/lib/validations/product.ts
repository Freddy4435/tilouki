import { z } from "zod";

export const productSeasonSchema = z.enum([
  "printemps-ete",
  "automne-hiver",
  "toute-saison",
]);

export const productGenderSchema = z.enum(["fille", "garcon", "mixte"]);

export const productFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis.").max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide."),
  description: z.string().max(10000).optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  season: productSeasonSchema,
  gender: productGenderSchema,
  basePriceCents: z.number().int().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
