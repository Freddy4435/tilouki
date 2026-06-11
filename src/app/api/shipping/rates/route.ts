import { NextResponse } from "next/server";

import { getAvailableCarriers } from "@/lib/shipping/carriers";
import { getActiveShippingRatesByCarrier } from "@/lib/supabase/queries/shipping";

/**
 * Barèmes des transporteurs actifs, groupés par provider.
 * `rates` conserve le barème Mondial Relay seul (compat clients existants).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const carriers = getAvailableCarriers();
    const ratesByCarrier = await getActiveShippingRatesByCarrier(
      carriers.map((carrier) => carrier.id),
    );

    return NextResponse.json({
      rates: ratesByCarrier.mondial_relay ?? [],
      ratesByCarrier,
      carriers,
    });
  } catch {
    return NextResponse.json(
      { rates: [], ratesByCarrier: {}, carriers: [], error: "Impossible de charger les tarifs." },
      { status: 500 },
    );
  }
}
