import { z } from "zod";

export const productGenderSchema = z.enum(["fille", "garcon", "mixte"]);
export const productStatusSchema = z.enum(["draft", "active", "archived"]);

const slugSchema = z
  .string()
  .min(1, "Le slug est requis.")
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (lettres minuscules, chiffres, tirets).");

const optionalEuros = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "" || v === null) return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? Math.round(n * 100) : null;
  });

const requiredEuros = z
  .union([z.string(), z.number()])
  .transform((v) => {
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    return Math.round(n * 100);
  })
  .refine((v) => Number.isFinite(v) && v >= 0, "Prix invalide.");

export const adminVariantSchema = z
  .object({
    id: z.string().uuid().optional(),
    sku: z.string().max(80).optional(),
    sizeLabel: z.string().max(50).optional().nullable(),
    ageLabel: z.string().max(50).optional().nullable(),
    color: z.string().max(50).optional().nullable(),
    priceCents: requiredEuros,
    compareAtPriceCents: optionalEuros,
    costCents: optionalEuros,
    stockQuantity: z.coerce.number().int().min(0, "Stock invalide."),
    weightGrams: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .transform((v) => {
        if (v === undefined || v === "" || v === null) return null;
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
      }),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (
      data.compareAtPriceCents != null &&
      data.compareAtPriceCents < data.priceCents
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Le prix barré doit être supérieur ou égal au prix.",
        path: ["compareAtPriceCents"],
      });
    }
  });

export const adminProductCoreSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(200),
  slug: slugSchema,
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  material: z.string().max(200).optional().nullable(),
  season: z.string().max(100).optional().nullable(),
  brandLabel: z.string().trim().max(100),
  madeIn: z.string().max(100).optional().nullable(),
  careInstructions: z.string().max(2000).optional().nullable(),
  gender: productGenderSchema,
  status: productStatusSchema,
  categoryId: z.string().optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.categoryId && !z.string().uuid().safeParse(data.categoryId).success) {
    ctx.addIssue({
      code: "custom",
      message: "Catégorie invalide.",
      path: ["categoryId"],
    });
  }
});

export const adminCreateProductSchema = adminProductCoreSchema.extend({
  initialVariants: z.array(adminVariantSchema).min(1, "Ajoutez au moins une variante (taille/âge)."),
});

export const adminUpdateProductSchema = adminProductCoreSchema.extend({
  id: z.string().uuid(),
});

export const adminProductImageSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url("URL invalide."),
  alt: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0),
});

export type AdminVariantInput = z.infer<typeof adminVariantSchema>;
export type AdminProductCoreInput = z.infer<typeof adminProductCoreSchema>;
export type AdminCreateProductInput = z.infer<typeof adminCreateProductSchema>;
export type AdminUpdateProductInput = z.infer<typeof adminUpdateProductSchema>;
