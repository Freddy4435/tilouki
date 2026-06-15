import { NextResponse } from "next/server";
import { z } from "zod";

import { getProductsBySlugs } from "@/lib/supabase/queries/products";

const MAX_SLUGS = 100;

const querySchema = z.object({
  slugs: z
    .string()
    .optional()
    .transform((value) =>
      (value ?? "")
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().min(1).max(120)).max(MAX_SLUGS)),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ slugs: searchParams.get("slugs") ?? "" });

  if (!parsed.success) {
    return NextResponse.json({ products: [] }, { status: 400 });
  }

  try {
    const products = await getProductsBySlugs(parsed.data.slugs);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
