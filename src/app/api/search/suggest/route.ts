import { NextResponse } from "next/server";
import { z } from "zod";

import { getSearchSuggestions } from "@/lib/search/suggest";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ q: searchParams.get("q") ?? "" });

  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getSearchSuggestions(parsed.data.q);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
