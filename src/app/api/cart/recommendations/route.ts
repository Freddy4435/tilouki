import { NextResponse } from "next/server";

import { getActiveProducts } from "@/lib/supabase/queries/products";

export async function GET() {
  try {
    const products = await getActiveProducts({ limit: 4 });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
