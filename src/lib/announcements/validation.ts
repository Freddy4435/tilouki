import { z } from "zod";

import { DEFAULT_SHOP_ANNOUNCEMENTS } from "@/lib/announcements/defaults";
import type { ShopAnnouncement } from "@/lib/announcements/types";

const optionalHrefSchema = z
  .union([
    z.string().trim().url("Lien invalide."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (!value || value === "") return null;
    return value;
  });

export const shopAnnouncementSchema = z
  .object({
    text: z.string().trim().max(120, "120 caractères maximum."),
    href: optionalHrefSchema.optional(),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.active && data.text.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le message actif ne peut pas être vide.",
        path: ["text"],
      });
    }
  });

export const shopAnnouncementsListSchema = z
  .array(shopAnnouncementSchema)
  .max(3, "Maximum 3 messages.");

export function parseShopAnnouncementsJson(
  raw: unknown,
): { ok: true; data: ShopAnnouncement[] } | { ok: false; error: string } {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    if (!raw.trim()) {
      return { ok: true, data: [] };
    }
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "Format des annonces invalide." };
    }
  }

  const result = shopAnnouncementsListSchema.safeParse(parsed);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Annonces invalides.";
    return { ok: false, error: message };
  }

  return { ok: true, data: result.data };
}

export function normalizeShopAnnouncements(raw: unknown): ShopAnnouncement[] {
  const parsed = parseShopAnnouncementsJson(raw);
  if (parsed.ok && parsed.data.length > 0) {
    return parsed.data;
  }
  return DEFAULT_SHOP_ANNOUNCEMENTS.map((item) => ({ ...item }));
}
