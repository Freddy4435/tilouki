import { NextResponse } from "next/server";

import { getMondialRelayWidgetConfig } from "@/lib/shipping/providers/mondial-relay/widget";

export async function GET() {
  return NextResponse.json(getMondialRelayWidgetConfig());
}
