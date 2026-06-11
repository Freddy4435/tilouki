"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { checkRateLimit } from "@/lib/security/rate-limit";
import { getOrderByTrackingToken } from "@/lib/supabase/queries/orders";
import type { OrderTrackingInfo } from "@/types/catalog";

const trackingTokenSchema = z.string().uuid("Numéro de suivi invalide.");

export async function trackOrderAction(token: string): Promise<OrderTrackingInfo | null> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const limit = await checkRateLimit({
    key: `${ip}:track-order`,
    limit: 10,
    windowSec: 60,
  });

  if (!limit.allowed) {
    throw new Error("Trop de tentatives. Réessayez dans une minute.");
  }

  const parsed = trackingTokenSchema.safeParse(token.trim());
  if (!parsed.success) {
    return null;
  }

  return getOrderByTrackingToken(parsed.data);
}
