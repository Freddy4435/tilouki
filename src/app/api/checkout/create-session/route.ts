import { NextResponse } from "next/server";

import { guardApiRequest, parseJsonBody } from "@/lib/security/api";
import { createCheckoutSession, StripeCheckoutError } from "@/lib/stripe";
import { checkoutSessionSchema } from "@/lib/validations/checkout";

export async function POST(request: Request) {
  const blocked = guardApiRequest(request, {
    rateLimit: { route: "checkout", limit: 10, windowSec: 60 },
  });
  if (blocked) return blocked;

  const parsed = await parseJsonBody(request, checkoutSessionSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const session = await createCheckoutSession(parsed.data);
    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof StripeCheckoutError) {
      const publicMessage =
        error.status === 400
          ? "Impossible de finaliser la commande. Vérifiez votre panier et le point relais."
          : "Le paiement est temporairement indisponible.";
      return NextResponse.json({ error: publicMessage }, { status: error.status });
    }

    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Le paiement n'est pas encore configuré." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Impossible de préparer le paiement. Réessayez." },
      { status: 500 },
    );
  }
}
