import { z } from "zod";

export const editorialBlockSchema = z
  .object({
    title: z.string().trim().max(80, "80 caractères maximum."),
    hook: z.string().trim().max(160, "160 caractères maximum."),
    imageUrl: z.string().trim().url("Image invalide."),
    href: z.string().trim().min(1, "Lien requis."),
    active: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.active !== false && data.title.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le titre actif doit contenir au moins 2 caractères.",
        path: ["title"],
      });
    }
  });

export const editorialBlocksListSchema = z
  .array(editorialBlockSchema)
  .max(3, "Maximum 3 blocs éditoriaux.");

export function parseEditorialBlocksJson(
  raw: unknown,
):
  | { ok: true; data: z.infer<typeof editorialBlockSchema>[] }
  | { ok: false; error: string } {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    if (!raw.trim()) {
      return { ok: true, data: [] };
    }
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "Format des blocs éditoriaux invalide." };
    }
  }

  const result = editorialBlocksListSchema.safeParse(parsed);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Blocs éditoriaux invalides.";
    return { ok: false, error: message };
  }

  return { ok: true, data: result.data };
}

export function normalizeEditorialBlocks(
  raw: unknown,
): z.infer<typeof editorialBlockSchema>[] {
  const parsed = parseEditorialBlocksJson(raw);
  if (!parsed.ok) return [];
  return parsed.data.filter((block) => block.active !== false);
}
