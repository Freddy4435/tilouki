import { NextResponse } from "next/server";

import { ordersToCsv } from "@/lib/admin/orders-csv";
import { parseQueryParams } from "@/lib/security/api";
import { listAdminOrders } from "@/lib/supabase/queries/admin/orders";
import { adminOrdersExportQuerySchema } from "@/lib/validations/admin";
import { getAdminUserOrNull } from "@/server/auth";

export async function GET(request: Request) {
  const user = await getAdminUserOrNull();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = parseQueryParams(searchParams, adminOrdersExportQuerySchema);
  if ("error" in parsed) return parsed.error;

  const orders = await listAdminOrders({
    query: parsed.data.q,
    status: parsed.data.status,
    paymentStatus: parsed.data.payment,
  });

  const csv = ordersToCsv(orders);
  const filename = `commandes-tilouki-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
