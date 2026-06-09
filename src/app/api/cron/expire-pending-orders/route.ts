import { NextResponse } from "next/server";

import { logSecure } from "@/lib/security/log";
import { expirePendingOrders } from "@/lib/supabase/queries/orders";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const count = await expirePendingOrders();
    logSecure("info", "Cron expire-pending-orders", { count });
    return NextResponse.json({ ok: true, expired: count });
  } catch (error) {
    logSecure("error", "Cron expire-pending-orders échoué", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Échec du traitement." }, { status: 500 });
  }
}
