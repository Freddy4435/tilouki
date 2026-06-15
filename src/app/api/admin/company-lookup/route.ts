import { NextResponse } from "next/server";

import { lookupCompanyBySiret } from "@/lib/admin/company-lookup";
import { parseQueryParams } from "@/lib/security/api";
import { companyLookupQuerySchema } from "@/lib/validations/admin";
import { getAdminUserOrNull } from "@/server/auth";

export async function GET(request: Request) {
  const user = await getAdminUserOrNull();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = parseQueryParams(searchParams, companyLookupQuerySchema);
  if ("error" in parsed) return parsed.error;

  const outcome = await lookupCompanyBySiret(parsed.data.siret);
  if (!outcome.ok) {
    const status =
      outcome.code === "api_unavailable"
        ? 503
        : outcome.code === "invalid_siret"
          ? 400
          : 404;
    return NextResponse.json(
      { error: outcome.message, code: outcome.code },
      { status },
    );
  }

  return NextResponse.json({
    legalName: outcome.legalName,
    address: outcome.address,
    apeCode: outcome.apeCode,
    suggestedLegalStatus: outcome.suggestedLegalStatus,
  });
}
