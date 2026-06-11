import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getShippingConfigurationError,
  isShippingConfiguredForCheckout,
} from "@/lib/shipping/checkout";
import { getShippingProvider } from "@/lib/shipping/provider";
import { guardApiRequest } from "@/lib/security/api";

const querySchema = z
  .object({
    zip: z.string().max(10).optional(),
    country: z.string().length(2).optional(),
    city: z.string().max(100).optional(),
    weightGrams: z.coerce.number().int().min(0).optional(),
    carrier: z.enum(["mondial_relay", "chronopost"]).default("mondial_relay"),
  })
  .refine(
    (data) => {
      const zip = data.zip?.trim() ?? "";
      const city = data.city?.trim() ?? "";
      return zip.length >= 4 || city.length >= 2;
    },
    { message: "Code postal (4 caractères) ou ville (2 caractères) requis." },
  );

export async function GET(request: Request) {
  const blocked = await guardApiRequest(request, {
    rateLimit: { route: "shipping-relay-points", limit: 20, windowSec: 60 },
  });
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    zip: searchParams.get("zip")?.trim() || undefined,
    country: searchParams.get("country") ?? "FR",
    city: searchParams.get("city")?.trim() || undefined,
    weightGrams: searchParams.get("weightGrams") ?? undefined,
    carrier: searchParams.get("carrier") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paramètres invalides.", points: [], configured: false, source: "mondial_relay_api" },
      { status: 400 },
    );
  }

  const { carrier, ...searchInput } = parsed.data;

  if (!isShippingConfiguredForCheckout(carrier)) {
    return NextResponse.json({
      points: [],
      source: carrier === "chronopost" ? "chronopost_api" : "mondial_relay_api",
      configured: false,
      devMock: false,
      error: getShippingConfigurationError(carrier),
    });
  }

  try {
    const provider = getShippingProvider(carrier);
    const result = await provider.searchRelayPoints({
      zip: searchInput.zip ?? "",
      country: searchInput.country,
      city: searchInput.city,
      weightGrams: searchInput.weightGrams,
    });

    return NextResponse.json({
      points: result.points,
      source: result.source,
      configured: result.configured,
      provider: provider.name,
      carrier,
      devMock: result.source === "dev_mock",
      message: result.message,
      error:
        result.configured && result.points.length === 0
          ? (result.message ?? "Aucun point relais trouvé pour ce code postal.")
          : undefined,
    });
  } catch {
    return NextResponse.json(
      {
        points: [],
        configured: true,
        source: carrier === "chronopost" ? "chronopost_api" : "mondial_relay_api",
        error: "Recherche impossible. Réessayez.",
      },
      { status: 500 },
    );
  }
}
