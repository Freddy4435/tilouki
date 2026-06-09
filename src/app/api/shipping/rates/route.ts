import { NextResponse } from "next/server";

import { getActiveShippingRates } from "@/lib/supabase/queries/shipping";

export async function GET() {
  try {
    const rates = await getActiveShippingRates();
    return NextResponse.json({ rates });
  } catch {
    return NextResponse.json({ rates: [], error: "Impossible de charger les tarifs." }, { status: 500 });
  }
}
