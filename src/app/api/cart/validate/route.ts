import { NextResponse } from "next/server";

import { guardApiRequest, parseJsonBody } from "@/lib/security/api";
import { validateCartStock } from "@/lib/supabase/queries/cart";
import { cartValidateSchema } from "@/lib/validations/cart";

export async function POST(request: Request) {
  const blocked = await guardApiRequest(request, {
    rateLimit: { route: "cart-validate", limit: 30, windowSec: 60 },
  });
  if (blocked) return blocked;

  const parsed = await parseJsonBody(request, cartValidateSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await validateCartStock(parsed.data.items);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Impossible de vérifier le stock pour le moment." },
      { status: 500 },
    );
  }
}
