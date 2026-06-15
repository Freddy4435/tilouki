"use server";

import { headers } from "next/headers";

import { checkRateLimit, rateLimitDeniedMessage } from "@/lib/security/rate-limit";
import { getOrderByTrackingToken } from "@/lib/supabase/queries/orders";
import { validateTrackingTokenLookup } from "@/lib/validations/tracking";
import type { OrderTrackingInfo } from "@/types/catalog";

export async function trackOrderAction(
  token: string,
): Promise<OrderTrackingInfo | null> {
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
    throw new Error(rateLimitDeniedMessage(limit));
  }

  const validation = validateTrackingTokenLookup(token);
  if (!validation.ok) {
    return null;
  }

  return getOrderByTrackingToken(validation.token);
}
