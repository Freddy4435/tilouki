import { NextResponse } from "next/server";
import { z } from "zod";

import { getShippingProvider } from "@/lib/mondial-relay/provider";

const querySchema = z.object({
  zip: z.string().min(4).max(10),
  country: z.string().length(2).optional(),
  city: z.string().max(100).optional(),
  weightGrams: z.coerce.number().int().min(0).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    zip: searchParams.get("zip") ?? "",
    country: searchParams.get("country") ?? "FR",
    city: searchParams.get("city") ?? undefined,
    weightGrams: searchParams.get("weightGrams") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Code postal invalide.", points: [], configured: false, source: "mondial_relay_api" },
      { status: 400 },
    );
  }

  try {
    const provider = getShippingProvider();
    const result = await provider.searchRelayPoints(parsed.data);

    return NextResponse.json({
      points: result.points,
      source: result.source,
      configured: result.configured,
      provider: provider.name,
      devMock: result.source === "dev_mock",
      message: result.message,
      error: result.configured && result.points.length === 0 ? result.message : undefined,
    });
  } catch {
    return NextResponse.json(
      {
        points: [],
        configured: true,
        source: "mondial_relay_api",
        error: "Recherche impossible. Réessayez.",
      },
      { status: 500 },
    );
  }
}
