import { z } from "zod";

export const importGenderSchema = z.enum(["fille", "garcon", "mixte"], {
  error: "Genre invalide (fille, garcon, mixte).",
});

export const importRowSchema = z.object({
  category: z.string().trim().min(1, "Catégorie requise."),
  name: z.string().trim().min(1, "Nom produit requis."),
  description: z.string().trim().optional().nullable(),
  material: z.string().trim().optional().nullable(),
  season: z.string().trim().optional().nullable(),
  made_in: z.string().trim().optional().nullable(),
  gender: importGenderSchema,
  color: z.string().trim().optional().nullable(),
  size_label: z.string().trim().optional().nullable(),
  age_label: z.string().trim().optional().nullable(),
  price_cents: z.coerce.number().int().min(0, "Prix invalide."),
  cost_cents: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "" || v === null) return null;
      const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
      return Number.isFinite(n) ? Math.round(n) : null;
    }),
  stock_quantity: z.coerce.number().int().min(0, "Stock invalide."),
  weight_grams: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "" || v === null) return null;
      const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
      return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
    }),
  image_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => !v || /^https?:\/\//i.test(v), "URL image invalide."),
});

export type ImportRowData = z.infer<typeof importRowSchema>;

export type ImportRowStatus = "valid" | "duplicate" | "error";

export interface ImportPreviewRow {
  lineNumber: number;
  status: ImportRowStatus;
  message?: string;
  data?: ImportRowData;
  productSlug?: string;
  variantKey?: string;
}

export interface ImportPreviewResult {
  headers: string[];
  separator: "," | ";";
  rows: ImportPreviewRow[];
  summary: {
    total: number;
    valid: number;
    duplicate: number;
    error: number;
  };
  headerError?: string;
}

export interface ImportExecuteResult {
  imported: number;
  skipped: number;
  errors: number;
  categoriesCreated: number;
  productsCreated: number;
  variantsCreated: number;
  details: { lineNumber: number; status: "imported" | "skipped" | "error"; message?: string }[];
}
