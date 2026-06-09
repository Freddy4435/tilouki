import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateShippingRate } from "@/lib/mondial-relay/rates";
import { getActiveShippingRates } from "@/lib/supabase/queries/shipping";

const querySchema = z.object({
  weightGrams: z.coerce.number().int().min(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    weightGrams: searchParams.get("weightGrams") ?? "0",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Poids invalide." }, { status: 400 });
  }

  try {
    const rates = await getActiveShippingRates();
    const result = calculateShippingRate(parsed.data.weightGrams, rates);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Estimation impossible." }, { status: 500 });
  }
}
