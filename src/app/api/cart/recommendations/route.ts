import { NextResponse } from "next/server";
import { z } from "zod";

import { getCartComplementProducts } from "@/lib/cart/cart-complement.server";

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
    .pipe(z.array(z.string().min(1).max(120)).max(32)),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ slugs: searchParams.get("slugs") ?? "" });

  if (!parsed.success || parsed.data.slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await getCartComplementProducts(parsed.data.slugs);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
