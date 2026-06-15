import { z } from "zod";

const optionalSocialUrlSchema = z
  .union([
    z.string().trim().url("URL invalide."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (!value || value === "") return null;
    return value;
  });

export const shopSocialLinksSchema = z.object({
  instagram: optionalSocialUrlSchema.optional(),
  facebook: optionalSocialUrlSchema.optional(),
  tiktok: optionalSocialUrlSchema.optional(),
});

export type ShopSocialLinksInput = z.infer<typeof shopSocialLinksSchema>;

export function parseShopSocialLinksJson(
  raw: unknown,
): { ok: true; data: ShopSocialLinksInput } | { ok: false; error: string } {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    if (!raw.trim()) {
      return { ok: true, data: {} };
    }
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "Format des liens sociaux invalide." };
    }
  }

  const result = shopSocialLinksSchema.safeParse(parsed ?? {});
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Liens sociaux invalides.";
    return { ok: false, error: message };
  }

  return { ok: true, data: result.data };
}

export function normalizeShopSocialLinks(raw: unknown): ShopSocialLinksInput {
  const parsed = parseShopSocialLinksJson(raw);
  return parsed.ok ? parsed.data : {};
}

export function hasVisibleSocialLinks(links: ShopSocialLinksInput): boolean {
  return Boolean(links.instagram || links.facebook || links.tiktok);
}
