import { NextResponse } from "next/server";
import { z } from "zod";

import { isChronopostQuickCostEnabled } from "@/lib/shipping/env";
import { getQuickCostPriceCents } from "@/lib/shipping/providers/chronopost/quickcost";
import { calculateShippingRate } from "@/lib/shipping/rates";
import { getActiveShippingRates } from "@/lib/supabase/queries/shipping";
import { guardApiRequest } from "@/lib/security/api";

const querySchema = z.object({
  weightGrams: z.coerce.number().int().min(0).max(10000),
  carrier: z.enum(["mondial_relay", "chronopost"]).default("mondial_relay"),
  zip: z
    .string()
    .regex(/^\d{5}$/)
    .optional(),
});

export async function GET(request: Request) {
  const blocked = await guardApiRequest(request, {
    rateLimit: { route: "shipping-estimate", limit: 60, windowSec: 60 },
  });
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    weightGrams: searchParams.get("weightGrams") ?? "0",
    carrier: searchParams.get("carrier") ?? undefined,
    zip: searchParams.get("zip") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  const { weightGrams, carrier, zip } = parsed.data;

  try {
    const rates = await getActiveShippingRates(carrier);
    const result = calculateShippingRate(weightGrams, rates);
    let priceCents = result.priceCents;

    // Cotation QuickCost au devis (opt-in Chronopost, CP destination connu).
    if (carrier === "chronopost" && zip && isChronopostQuickCostEnabled()) {
      const quickCostCents = await getQuickCostPriceCents(zip, weightGrams);
      if (quickCostCents !== null) {
        priceCents = quickCostCents;
      }
    }

    return NextResponse.json({
      ...result,
      priceCents,
      provider: carrier,
      method: "relay_point",
    });
  } catch {
    return NextResponse.json({ error: "Estimation impossible." }, { status: 500 });
  }
}
