import { NextResponse } from "next/server";
import { fetchAggregatedOffers } from "@/lib/aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchAggregatedOffers();
  return NextResponse.json(data, { status: 200 });
}
